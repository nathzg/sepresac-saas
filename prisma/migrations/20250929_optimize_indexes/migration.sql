-- =====================================================
-- Performance Optimization Migration
-- =====================================================

-- Índices para consultas frecuentes de proyectos
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_projects_owner_id" ON "projects"("ownerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_projects_status" ON "projects"("status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_projects_created_at" ON "projects"("createdAt");

-- Índices para consultas de miembros de proyecto
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_members_user_id" ON "project_members"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_members_project_id" ON "project_members"("projectId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_members_role" ON "project_members"("role");

-- Índices para consultas de eventos
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_project_id" ON "events"("projectId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_creator_id" ON "events"("creatorId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_start_date" ON "events"("startDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_end_date" ON "events"("endDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_created_at" ON "events"("createdAt");

-- Índices para consultas de contactos
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_project_id" ON "contacts"("projectId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_email" ON "contacts"("email");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_contacts_name" ON "contacts"("name");

-- Índices para consultas de notificaciones
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_read" ON "notifications"("read");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_type" ON "notifications"("type");

-- Índices compuestos para consultas complejas
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notifications_user_read_created" ON "notifications"("userId", "read", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_events_project_start_date" ON "events"("projectId", "startDate");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_members_user_role" ON "project_members"("userId", "role");
