-- ==============================================================================
-- NIVALO STORE v2 — MÓDULO DE AUTENTICACIÓN, ROLES Y SEGURIDAD RLS
-- PostgreSQL / Supabase Auth
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIO (public.profiles)
-- Vinculada estrictamente a la tabla auth.users de Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    ciudad TEXT DEFAULT 'Lima',
    role TEXT NOT NULL DEFAULT 'CLIENTE' CHECK (role IN ('CLIENTE', 'ADMIN')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Asegurar que la tabla pedidos tenga la columna user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pedidos' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.pedidos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Asegurar que la tabla clientes tenga la columna user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clientes' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.clientes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. FUNCIÓN DE SEGURIDAD: VERIFICAR SI EL USUARIO ES ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER: AUTO-CREACIÓN DE PERFIL AL REGISTRARSE (Supabase Auth)
-- Asigna 'ADMIN' automáticamente al correo oficial alex1400ahjulio@gmail.com
-- y 'CLIENTE' a todos los demás usuarios de forma segura.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombres, apellidos, telefono, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombres', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
        COALESCE(NEW.raw_user_meta_data->>'telefono', ''),
        CASE 
            WHEN LOWER(NEW.email) = LOWER('alex1400ahjulio@gmail.com') THEN 'ADMIN'
            ELSE 'CLIENTE'
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = CASE 
            WHEN LOWER(EXCLUDED.email) = LOWER('alex1400ahjulio@gmail.com') THEN 'ADMIN'
            ELSE public.profiles.role
        END,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. TRIGGER DE PROTECCIÓN: IMPEDIR QUE UN CLIENTE CAMBIE SU ROL A ADMIN
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se intenta cambiar el rol y el usuario ejecutante NO es ADMIN, abortar inmediatamente
    IF NEW.role <> OLD.role THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Acceso denegado: No tienes autorización para modificar roles.';
        END IF;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_role();

-- ==============================================================================
-- 6. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- A) Activar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_cobro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_estados ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas antiguas
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "productos_select_public" ON public.productos;
DROP POLICY IF EXISTS "productos_admin_all" ON public.productos;
DROP POLICY IF EXISTS "pedidos_select_policy" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_insert_policy" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_update_admin" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_delete_admin" ON public.pedidos;
DROP POLICY IF EXISTS "detalles_select_policy" ON public.detalles_pedido;
DROP POLICY IF EXISTS "detalles_insert_policy" ON public.detalles_pedido;
DROP POLICY IF EXISTS "detalles_admin_modify" ON public.detalles_pedido;
DROP POLICY IF EXISTS "pagos_select_policy" ON public.pagos;
DROP POLICY IF EXISTS "pagos_insert_policy" ON public.pagos;
DROP POLICY IF EXISTS "pagos_admin_modify" ON public.pagos;
DROP POLICY IF EXISTS "historial_select_policy" ON public.historial_estados;
DROP POLICY IF EXISTS "historial_admin_all" ON public.historial_estados;

-- B) POLÍTICAS PARA: profiles
-- Un usuario solo puede leer su propio perfil; el ADMIN puede leer todos los perfiles
CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Un usuario puede actualizar sus propios datos personales (el trigger bloquea cambios de rol)
CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- C) POLÍTICAS PARA: productos
-- El catálogo es de libre lectura pública (clientes y visitantes)
CREATE POLICY "productos_select_public" ON public.productos
    FOR SELECT USING (true);

-- Solo ADMIN puede crear, editar inventario o eliminar productos
CREATE POLICY "productos_admin_all" ON public.productos
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- D) POLÍTICAS PARA: pedidos
-- CLIENTE: solo puede ver sus propios pedidos (user_id = auth.uid()); ADMIN: ve todos
CREATE POLICY "pedidos_select_policy" ON public.pedidos
    FOR SELECT USING (public.is_admin() OR user_id = auth.uid());

-- Inserción permitida (creación desde la tienda o panel)
CREATE POLICY "pedidos_insert_policy" ON public.pedidos
    FOR INSERT WITH CHECK (true);

-- Modificación de pedidos: EXCLUSIVA para ADMIN (los clientes no pueden cambiar estados)
CREATE POLICY "pedidos_update_admin" ON public.pedidos
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "pedidos_delete_admin" ON public.pedidos
    FOR DELETE USING (public.is_admin());

-- E) POLÍTICAS PARA: detalles_pedido
CREATE POLICY "detalles_select_policy" ON public.detalles_pedido
    FOR SELECT USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pedidos p 
            WHERE p.id = pedido_id AND (p.user_id = auth.uid() OR p.user_id IS NULL)
        )
    );

CREATE POLICY "detalles_insert_policy" ON public.detalles_pedido
    FOR INSERT WITH CHECK (true);

CREATE POLICY "detalles_admin_modify" ON public.detalles_pedido
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- F) POLÍTICAS PARA: pagos
CREATE POLICY "pagos_select_policy" ON public.pagos
    FOR SELECT USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pedidos p 
            WHERE p.id = pedido_id AND (p.user_id = auth.uid() OR p.user_id IS NULL)
        )
    );

CREATE POLICY "pagos_insert_policy" ON public.pagos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "pagos_admin_modify" ON public.pagos
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- G) POLÍTICAS PARA: historial_estados
CREATE POLICY "historial_select_policy" ON public.historial_estados
    FOR SELECT USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pedidos p 
            WHERE p.id = pedido_id AND (p.user_id = auth.uid() OR p.user_id IS NULL)
        )
    );

CREATE POLICY "historial_admin_all" ON public.historial_estados
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- H) POLÍTICAS PARA: clientes
CREATE POLICY "clientes_select_policy" ON public.clientes
    FOR SELECT USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "clientes_all_policy" ON public.clientes
    FOR ALL USING (public.is_admin() OR user_id = auth.uid())
    WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- ==============================================================================
-- 7. ASIGNAR EL ROL DE ADMINISTRADOR A TU CUENTA
-- ==============================================================================
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE LOWER(email) = LOWER('alex1400ahjulio@gmail.com');
-- ==============================================================================
