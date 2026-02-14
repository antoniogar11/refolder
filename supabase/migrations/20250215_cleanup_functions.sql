-- Limpiar funciones huérfanas que quedaron
DROP FUNCTION IF EXISTS calculate_duration_minutes(time, time) CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
DROP FUNCTION IF EXISTS can_manage_time_entry(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_company(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_company_admin(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS is_company_admin_check(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS is_company_member_or_owner(uuid, uuid) CASCADE;
