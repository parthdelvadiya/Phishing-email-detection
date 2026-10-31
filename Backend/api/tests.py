from __future__ import annotations

from rest_framework import status
from rest_framework.test import APITestCase

from api.features import build_structural_feature_vector, extract_url_features, url_entropy
from api.models import PredictionRecord
from api.preprocessor import extract_urls, preprocess_email, strip_html


class PhishingAPITests(APITestCase):

    def test_api_root(self):
        """Test API root catalog endpoint returns structured 200 response."""
        response = self.client.get('/api/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['error'])
        self.assertEqual(response.data['statuscode'], status.HTTP_200_OK)
        self.assertIn("core_prediction", response.data['data'])
        self.assertIn("model_and_evaluation", response.data['data'])
        self.assertIn("history_and_audit", response.data['data'])

    def test_predict_single_phishing_email(self):
        """Test analyzing a known phishing email pattern with integrated NLP and feature extraction."""
        payload = {
            "text": "<html><body>URGENT: Your account has been suspended! Please click <a href='http://192.168.1.1/login'>here</a> to verify your credentials immediately.</body></html>",
            "sender": "support@alert-bank.tk",
            "reply_to": "attacker@evil.com",
            "subject": "URGENT: Action Required",
            "save_record": True,
        }
        response = self.client.post('/api/predict/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['error'])
        self.assertEqual(response.data['statuscode'], status.HTTP_200_OK)
        
        data = response.data['data']
        self.assertEqual(data['verdict'], 'phishing')
        self.assertTrue(data['is_phishing'])
        self.assertTrue(data['security_signals']['has_ip_url'])
        self.assertTrue(data['security_signals']['sender_reply_to_mismatch'])
        self.assertGreater(data['confidence_score'], 0.5)

        # Verify internal preprocessing was executed and returned
        self.assertIn('preprocessing', data)
        self.assertEqual(data['preprocessing']['urls_count'], 1)
        self.assertIn("http://192.168.1.1/login", data['preprocessing']['urls_extracted'])
        self.assertIn("verifi", data['preprocessing']['cleaned_stemmed_text'])

        # Verify internal feature engineering was executed and returned
        self.assertIn('feature_engineering', data)
        self.assertEqual(data['feature_engineering']['structural_feature_count'], 13)
        self.assertEqual(len(data['feature_engineering']['structural_feature_vector']), 13)
        self.assertEqual(data['feature_engineering']['url_analysis']['has_ip_url'], 1.0)
        self.assertEqual(data['feature_engineering']['header_analysis']['sender_reply_to_mismatch'], 1.0)

        # Check database persistence
        self.assertEqual(PredictionRecord.objects.count(), 1)
        record = PredictionRecord.objects.first()
        self.assertEqual(record.verdict, 'phishing')
        self.assertTrue(record.has_ip_url)
        self.assertTrue(record.sender_reply_to_mismatch)

    def test_predict_single_legitimate_email(self):
        """Test analyzing a clean work email."""
        payload = {
            "text": "Hi Team, please find attached the meeting minutes and project timeline discussed yesterday. Let me know if you have any questions.",
            "sender": "alice@company.com",
            "reply_to": "alice@company.com",
            "subject": "Weekly Project Sync Notes"
        }
        response = self.client.post('/api/predict/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['error'])
        self.assertEqual(response.data['statuscode'], status.HTTP_200_OK)
        
        data = response.data['data']
        self.assertEqual(data['verdict'], 'legitimate')
        self.assertFalse(data['is_phishing'])
        self.assertFalse(data['security_signals']['has_ip_url'])
        self.assertFalse(data['security_signals']['sender_reply_to_mismatch'])

    def test_predict_invalid_data_empty_text(self):
        """Test error handling when text is missing or blank."""
        payload = {
            "text": "",
            "subject": "Hello"
        }
        response = self.client.post('/api/predict/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data['error'])
        self.assertEqual(response.data['statuscode'], status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid email data", response.data['message'])

    def test_internal_nlp_preprocessing_module(self):
        """Unit test confirming preprocessor operates seamlessly internally."""
        html = "<html><body>Click <a href='https://example.com/login'>here</a> to verify!</body></html>"
        urls = extract_urls(html)
        self.assertEqual(len(urls), 1)
        self.assertIn("https://example.com/login", urls)

        plain = strip_html(html)
        self.assertNotIn("<html>", plain)
        self.assertIn("Click", plain)

        cleaned, detected_urls = preprocess_email(html)
        self.assertIn("verifi", cleaned)
        self.assertEqual(len(detected_urls), 1)

    def test_internal_feature_extraction_module(self):
        """Unit test confirming structural feature vectorization operates internally."""
        urls = ["http://192.168.1.100/secure-login"]
        vec = build_structural_feature_vector(
            urls=urls,
            raw_text="URGENT: Click http://192.168.1.100/secure-login immediately",
            cleaned_text="urgent click immedi",
            sender_domain="bank.tk",
            reply_to_domain="evil.com",
            subject="URGENT Account Alert",
        )
        self.assertEqual(len(vec), 13)
        # url_count is 1.0
        self.assertEqual(vec[0], 1.0)
        # has_ip_url is 1.0
        self.assertEqual(vec[1], 1.0)
        # sender_reply_to_mismatch is 1.0
        self.assertEqual(vec[6], 1.0)

    def test_prediction_history_and_detail(self):
        """Test retrieving history, single detail by id, and record deletion."""
        self.client.post('/api/predict/', {
            "text": "Suspicious email with http://bit.ly/fake verify account",
            "subject": "Urgent"
        }, format='json')
        
        # Test history listing
        hist_resp = self.client.get('/api/history/')
        self.assertEqual(hist_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(hist_resp.data['error'])
        self.assertEqual(hist_resp.data['data']['count'], 1)
        record_id = hist_resp.data['data']['records'][0]['id']

        # Test detail view
        detail_resp = self.client.get(f'/api/history/{record_id}/')
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(detail_resp.data['error'])
        self.assertEqual(detail_resp.data['data']['id'], record_id)

        # Test delete
        del_resp = self.client.delete(f'/api/history/{record_id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(del_resp.data['error'])
        self.assertEqual(PredictionRecord.objects.count(), 0)

    def test_model_info_endpoint(self):
        """Test model telemetry endpoint."""
        response = self.client.get('/api/model-info/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['error'])
        data = response.data['data']
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['features']['total_features'], 15013)
        self.assertEqual(data['thresholds']['lightgbm_optimal_threshold'], 0.36)

    def test_dataset_summary_endpoint(self):
        """Test dataset telemetry endpoint."""
        response = self.client.get('/api/dataset/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['error'])
        data = response.data['data']
        self.assertEqual(data['total_emails'], 86456)
        self.assertEqual(data['split_configuration']['train_count'], 60519)

    def test_evaluation_report_endpoint(self):
        """Test evaluation benchmark report endpoint."""
        response = self.client.get('/api/evaluation/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['error'])
        data = response.data['data']
        self.assertIn("lightgbm", data)
        self.assertIn("random_forest", data)
        self.assertEqual(data['features']['total'], 15013)
