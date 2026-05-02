from dotenv import load_dotenv
load_dotenv()
import app
products = app._fetch_products()
print('type', type(products))
print('len', len(products) if products is not None else 'None')
print('first', products[0] if products else 'empty')
client = app.app.test_client()
resp = client.get('/')
print('status', resp.status_code)
text = resp.data.decode('utf-8')
print('page length', len(text))
print(text[:1200])
