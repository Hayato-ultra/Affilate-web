from dotenv import load_dotenv
load_dotenv()

from app import _get_supabase, PRODUCTS


def main():
    sb = _get_supabase()
    if not sb:
        print('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY is not configured.')
        return

    try:
        print('Seeding product data into Supabase...')
        res = sb.table('products').insert(PRODUCTS).execute()
        if hasattr(res, 'data') and res.data:
            print(f'Successfully seeded {len(res.data)} product records.')
        else:
            print('Seed completed. No rows were returned.')
    except Exception as exc:
        print('Seed failed:', exc)


if __name__ == '__main__':
    main()
