
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      about_sections: {
        Row: {
          id: string
          key: string
          title_vi: string
          title_km: string | null
          title_en: string | null
          content_vi: string | null
          content_km: string | null
          content_en: string | null
          summary_vi: string | null
          summary_km: string | null
          summary_en: string | null
          image_url: string | null
          display_order: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          key: string
          title_vi: string
          title_km?: string | null
          title_en?: string | null
          content_vi?: string | null
          content_km?: string | null
          content_en?: string | null
          summary_vi?: string | null
          summary_km?: string | null
          summary_en?: string | null
          image_url?: string | null
          display_order?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          key?: string
          title_vi?: string
          title_km?: string | null
          title_en?: string | null
          content_vi?: string | null
          content_km?: string | null
          content_en?: string | null
          summary_vi?: string | null
          summary_km?: string | null
          summary_en?: string | null
          image_url?: string | null
          display_order?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }

      categories: {
        Row: {
          id: string
          name_vi: string
          name_km: string | null
          name_en: string | null
          slug: string
          type: string | null
          module: string | null
          parent_id: string | null
          image_url: string | null
          description_vi: string | null
          description_km: string | null
          description_en: string | null
          created_at: string
          tenant_id: string | null
          order_position: number
          is_visible: boolean
        }
        Insert: {
          id?: string
          name_vi: string
          name_km?: string | null
          name_en?: string | null
          slug: string
          type?: string | null
          module?: string | null
          parent_id?: string | null
          image_url?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          created_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          name_vi?: string
          name_km?: string | null
          name_en?: string | null
          slug?: string
          type?: string | null
          module?: string | null
          parent_id?: string | null
          image_url?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          created_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }

      transactions: {
        Row: {
          id: string
          donor_name: string | null
          donor_phone: string | null
          donor_email: string | null
          amount: number
          currency: string | null
          purpose: string | null
          purpose_detail: string | null
          payment_method: string | null
          transaction_id: string | null
          status: 'pending' | 'completed' | 'failed' | 'refunded' | 'confirmed'
          note: string | null
          is_anonymous: boolean | null
          created_at: string
          updated_at: string | null
          completed_at: string | null
          tenant_id: string | null
        }
        Insert: {
          id?: string
          donor_name?: string | null
          donor_phone?: string | null
          donor_email?: string | null
          amount: number
          currency?: string | null
          purpose?: string | null
          purpose_detail?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'confirmed'
          note?: string | null
          is_anonymous?: boolean | null
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          id?: string
          donor_name?: string | null
          donor_phone?: string | null
          donor_email?: string | null
          amount?: number
          currency?: string | null
          purpose?: string | null
          purpose_detail?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'confirmed'
          note?: string | null
          is_anonymous?: boolean | null
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      transaction_projects: {
        Row: {
          id: string
          title_vi: string
          title_km: string | null
          description_vi: string | null
          description_km: string | null
          content_vi: string | null
          content_km: string | null
          thumbnail_url: string | null
          target_amount: number
          current_amount: number
          status: 'ongoing' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          slug: string | null
          tenant_id: string | null
        }
        Insert: {
          id?: string
          title_vi: string
          title_km?: string | null
          description_vi?: string | null
          description_km?: string | null
          content_vi?: string | null
          content_km?: string | null
          thumbnail_url?: string | null
          target_amount?: number
          current_amount?: number
          status?: 'ongoing' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          slug?: string | null
          tenant_id?: string | null
        }
        Update: {
          id?: string
          title_vi?: string
          title_km?: string | null
          description_vi?: string | null
          description_km?: string | null
          content_vi?: string | null
          content_km?: string | null
          thumbnail_url?: string | null
          target_amount?: number
          current_amount?: number
          status?: 'ongoing' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          slug?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_projects_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transaction_purposes: {
        Row: {
          id: string
          code: string
          name_vi: string
          name_km: string | null
          name_en: string | null
          is_active: boolean
          created_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          code: string
          name_vi: string
          name_km?: string | null
          name_en?: string | null
          is_active?: boolean
          created_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          code?: string
          name_vi?: string
          name_km?: string | null
          name_en?: string | null
          is_active?: boolean
          created_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }

      events: {
        Row: {
          id: string
          title_vi: string
          title_km: string | null
          title_en: string | null
          description_vi: string | null
          description_km: string | null
          description_en: string | null
          excerpt_vi: string | null
          excerpt_km: string | null
          excerpt_en: string | null
          start_date: string
          end_date: string | null
          start_time: string | null
          end_time: string | null
          location: string | null
          is_recurring: boolean | null
          recurrence_pattern: Json | null
          thumbnail_url: string | null
          registration_required: boolean | null
          max_participants: number | null
          current_participants: number | null
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
          approval_status: 'pending' | 'approved' | 'rejected'
          slug: string | null
          tenant_id: string | null
          published_to: string[] | null
        }
        Insert: {
          id?: string
          title_vi: string
          title_km?: string | null
          title_en?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          excerpt_vi?: string | null
          excerpt_km?: string | null
          excerpt_en?: string | null
          start_date: string
          end_date?: string | null
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          thumbnail_url?: string | null
          registration_required?: boolean | null
          max_participants?: number | null
          current_participants?: number | null
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
          approval_status?: 'pending' | 'approved' | 'rejected'
          slug?: string | null
          tenant_id?: string | null
          published_to?: string[] | null
        }
        Update: {
          id?: string
          title_vi?: string
          title_km?: string | null
          title_en?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          excerpt_vi?: string | null
          excerpt_km?: string | null
          excerpt_en?: string | null
          start_date?: string
          end_date?: string | null
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          is_recurring?: boolean | null
          recurrence_pattern?: Json | null
          thumbnail_url?: string | null
          registration_required?: boolean | null
          max_participants?: number | null
          current_participants?: number | null
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
          approval_status?: 'pending' | 'approved' | 'rejected'
          slug?: string | null
          tenant_id?: string | null
          published_to?: string[] | null
        }
        Relationships: []
      }

      hero_slides: {
        Row: {
          id: string
          title_vi: string | null
          title_en: string | null
          title_km: string | null
          subtitle_vi: string | null
          subtitle_en: string | null
          subtitle_km: string | null
          image_url: string
          cta1_enabled: boolean | null
          cta1_text_key: string | null
          cta1_link: string | null
          cta2_enabled: boolean | null
          cta2_text_key: string | null
          cta2_link: string | null
          is_active: boolean
          order_position: number
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          title_vi?: string | null
          title_en?: string | null
          title_km?: string | null
          subtitle_vi?: string | null
          subtitle_en?: string | null
          subtitle_km?: string | null
          image_url: string
          cta1_enabled?: boolean | null
          cta1_text_key?: string | null
          cta1_link?: string | null
          cta2_enabled?: boolean | null
          cta2_text_key?: string | null
          cta2_link?: string | null
          is_active?: boolean
          order_position?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          title_vi?: string | null
          title_en?: string | null
          title_km?: string | null
          subtitle_vi?: string | null
          subtitle_en?: string | null
          subtitle_km?: string | null
          image_url?: string
          cta1_enabled?: boolean | null
          cta1_text_key?: string | null
          cta1_link?: string | null
          cta2_enabled?: boolean | null
          cta2_text_key?: string | null
          cta2_link?: string | null
          is_active?: boolean
          order_position?: number
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          title_vi: string
          title_km: string | null
          title_en: string | null
          description_vi: string | null
          description_km: string | null
          description_en: string | null
          type: 'image' | 'video' | 'audio' | 'document' | 'book' | 'sutra' | 'external_link'
          url: string
          thumbnail_url: string | null
          file_size: number | null
          mime_type: string | null
          category_id: string | null
          event_id: string | null
          year: number | null
          tags: string[] | null
          author_name_vi: string | null
          author_name_km: string | null
          author_name_en: string | null
          view_count: number | null
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          title_vi: string
          title_km?: string | null
          title_en?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          type: 'image' | 'video' | 'audio' | 'document' | 'book' | 'sutra' | 'external_link'
          url: string
          thumbnail_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          category_id?: string | null
          event_id?: string | null
          year?: number | null
          tags?: string[] | null
          author_name_vi?: string | null
          author_name_km?: string | null
          author_name_en?: string | null
          view_count?: number | null
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          title_vi?: string
          title_km?: string | null
          title_en?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          type?: 'image' | 'video' | 'audio' | 'document' | 'book' | 'sutra' | 'external_link'
          url?: string
          thumbnail_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          category_id?: string | null
          event_id?: string | null
          year?: number | null
          tags?: string[] | null
          author_name_vi?: string | null
          author_name_km?: string | null
          author_name_en?: string | null
          view_count?: number | null
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          id: string
          title_vi: string
          title_km: string | null
          title_en: string | null
          slug: string
          content_vi: string | null
          content_km: string | null
          content_en: string | null
          excerpt_vi: string | null
          excerpt_km: string | null
          excerpt_en: string | null
          thumbnail_url: string | null
          category_id: string | null
          status: 'draft' | 'published' | 'archived'
          published_at: string | null
          author_id: string | null
          view_count: number | null
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          title_vi: string
          title_km?: string | null
          title_en?: string | null
          slug: string
          content_vi?: string | null
          content_km?: string | null
          content_en?: string | null
          excerpt_vi?: string | null
          excerpt_km?: string | null
          excerpt_en?: string | null
          thumbnail_url?: string | null
          category_id?: string | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          author_id?: string | null
          view_count?: number | null
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          title_vi?: string
          title_km?: string | null
          title_en?: string | null
          slug?: string
          content_vi?: string | null
          content_km?: string | null
          content_en?: string | null
          excerpt_vi?: string | null
          excerpt_km?: string | null
          excerpt_en?: string | null
          thumbnail_url?: string | null
          category_id?: string | null
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          author_id?: string | null
          view_count?: number | null
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          org_type: string | null
          description: string | null
          website_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          tenant_id: string | null
          total_donated: number | null
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          org_type?: string | null
          description?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
          total_donated?: number | null
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          org_type?: string | null
          description?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
          total_donated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      pages: {
        Row: {
          id: string
          title_vi: string
          title_km: string | null
          title_en: string | null
          slug: string
          content_vi: string | null
          content_km: string | null
          content_en: string | null
          meta_description_vi: string | null
          meta_description_km: string | null
          meta_description_en: string | null
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          title_vi: string
          title_km?: string | null
          title_en?: string | null
          slug: string
          content_vi?: string | null
          content_km?: string | null
          content_en?: string | null
          meta_description_vi?: string | null
          meta_description_km?: string | null
          meta_description_en?: string | null
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          title_vi?: string
          title_km?: string | null
          title_en?: string | null
          slug?: string
          content_vi?: string | null
          content_km?: string | null
          content_en?: string | null
          meta_description_vi?: string | null
          meta_description_km?: string | null
          meta_description_en?: string | null
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          value: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          tenant_id: string
          value: string | null
          description: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          tenant_id?: string
          value?: string | null
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          tenant_id?: string
          value?: string | null
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          id: string
          title_vi: string
          title_km: string | null
          title_en: string | null
          description_vi: string | null
          description_km: string | null
          description_en: string | null
          media_type: string
          media_url: string
          thumbnail_url: string | null
          duration_minutes: number | null
          instructor_name_vi: string | null
          instructor_name_km: string | null
          instructor_name_en: string | null
          topic_vi: string | null
          topic_km: string | null
          topic_en: string | null
          recorded_date: string | null
          is_featured: boolean | null
          order_position: number | null
          view_count: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          category_id: string | null
          tenant_id: string | null
          slug: string | null
          published_to: string[] | null
          approval_status: string | null
        }
        Insert: {
          id?: string
          title_vi: string
          title_km?: string | null
          title_en?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          media_type: string
          media_url: string
          thumbnail_url?: string | null
          duration_minutes?: number | null
          instructor_name_vi?: string | null
          instructor_name_km?: string | null
          instructor_name_en?: string | null
          topic_vi?: string | null
          topic_km?: string | null
          topic_en?: string | null
          recorded_date?: string | null
          is_featured?: boolean | null
          order_position?: number | null
          view_count?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          category_id?: string | null
          tenant_id?: string | null
          slug?: string | null
          published_to?: string[] | null
          approval_status?: string | null
        }
        Update: {
          id?: string
          title_vi?: string
          title_km?: string | null
          title_en?: string | null
          description_vi?: string | null
          description_km?: string | null
          description_en?: string | null
          media_type?: string
          media_url?: string
          thumbnail_url?: string | null
          duration_minutes?: number | null
          instructor_name_vi?: string | null
          instructor_name_km?: string | null
          instructor_name_en?: string | null
          topic_vi?: string | null
          topic_km?: string | null
          topic_en?: string | null
          recorded_date?: string | null
          is_featured?: boolean | null
          order_position?: number | null
          view_count?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          category_id?: string | null
          tenant_id?: string | null
          slug?: string | null
          published_to?: string[] | null
          approval_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          locale: string | null
          subscribed_at: string
          is_active: boolean
          tenant_id: string | null
        }
        Insert: {
          id?: string
          email: string
          locale?: string | null
          subscribed_at?: string
          is_active?: boolean
          tenant_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          locale?: string | null
          subscribed_at?: string
          is_active?: boolean
          tenant_id?: string | null
        }
        Relationships: []
      }
      content_revisions: {
        Row: {
          id: string
          table_name: string
          record_id: string
          changed_by: string | null
          old_data: Json | null
          new_data: Json
          change_summary: string | null
          tenant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          changed_by?: string | null
          old_data?: Json | null
          new_data: Json
          change_summary?: string | null
          tenant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          changed_by?: string | null
          old_data?: Json | null
          new_data?: Json
          change_summary?: string | null
          tenant_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_revisions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_revisions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      charity_posts: {
        Row: {
          id: string
          title_vi: string
          title_km: string | null
          title_en: string | null
          excerpt_vi: string
          excerpt_km: string | null
          excerpt_en: string | null
          image_url: string
          image_alt_vi: string | null
          image_alt_km: string | null
          image_alt_en: string | null
          link_url: string | null
          event_date: string
          is_featured: boolean
          order_position: number
          is_active: boolean
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          title_vi: string
          title_km?: string | null
          title_en?: string | null
          excerpt_vi: string
          excerpt_km?: string | null
          excerpt_en?: string | null
          image_url: string
          image_alt_vi?: string | null
          image_alt_km?: string | null
          image_alt_en?: string | null
          link_url?: string | null
          event_date: string
          is_featured?: boolean
          order_position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          title_vi?: string
          title_km?: string | null
          title_en?: string | null
          excerpt_vi?: string
          excerpt_km?: string | null
          excerpt_en?: string | null
          image_url?: string
          image_alt_vi?: string | null
          image_alt_km?: string | null
          image_alt_en?: string | null
          link_url?: string | null
          event_date?: string
          is_featured?: boolean
          order_position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string | null
          full_name: string
          phone: string | null
          email: string | null
          num_participants: number
          note: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          event_id?: string | null
          full_name: string
          phone?: string | null
          email?: string | null
          num_participants?: number
          note?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          event_id?: string | null
          full_name?: string
          phone?: string | null
          email?: string | null
          num_participants?: number
          note?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      homepage_stats: {
        Row: {
          id: string
          order_position: number
          icon_emoji: string
          stat_value: number
          suffix: string | null
          label_vi: string
          label_km: string | null
          label_en: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          order_position?: number
          icon_emoji: string
          stat_value: number
          suffix?: string | null
          label_vi: string
          label_km?: string | null
          label_en?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          order_position?: number
          icon_emoji?: string
          stat_value?: number
          suffix?: string | null
          label_vi?: string
          label_km?: string | null
          label_en?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      quick_access_links: {
        Row: {
          id: string
          order_position: number
          icon_emoji: string
          translation_key: string
          href: string
          color_class: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          order_position?: number
          icon_emoji: string
          translation_key: string
          href: string
          color_class?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          order_position?: number
          icon_emoji?: string
          translation_key?: string
          href?: string
          color_class?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          quote_vi: string
          quote_km: string | null
          quote_en: string | null
          author_name_vi: string
          author_name_km: string | null
          author_name_en: string | null
          author_role_vi: string | null
          author_role_km: string | null
          author_role_en: string | null
          author_location: string | null
          is_featured: boolean
          order_position: number
          rating: number | null
          is_active: boolean
          approved: boolean
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          quote_vi: string
          quote_km?: string | null
          quote_en?: string | null
          author_name_vi: string
          author_name_km?: string | null
          author_name_en?: string | null
          author_role_vi?: string | null
          author_role_km?: string | null
          author_role_en?: string | null
          author_location?: string | null
          is_featured?: boolean
          order_position?: number
          rating?: number | null
          is_active?: boolean
          approved?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          quote_vi?: string
          quote_km?: string | null
          quote_en?: string | null
          author_name_vi?: string
          author_name_km?: string | null
          author_name_en?: string | null
          author_role_vi?: string | null
          author_role_km?: string | null
          author_role_en?: string | null
          author_location?: string | null
          is_featured?: boolean
          order_position?: number
          rating?: number | null
          is_active?: boolean
          approved?: boolean
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          question_vi: string
          question_km: string | null
          question_en: string | null
          answer_vi: string
          answer_km: string | null
          answer_en: string | null
          category: string
          display_order: number
          is_published: boolean
          approval_status: 'draft' | 'pending_review' | 'published' | 'rejected'
          created_at: string
          updated_at: string
          tenant_id: string | null
        }
        Insert: {
          id?: string
          question_vi: string
          question_km?: string | null
          question_en?: string | null
          answer_vi: string
          answer_km?: string | null
          answer_en?: string | null
          category?: string
          display_order?: number
          is_published?: boolean
          approval_status?: 'draft' | 'pending_review' | 'published' | 'rejected'
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Update: {
          id?: string
          question_vi?: string
          question_km?: string | null
          question_en?: string | null
          answer_vi?: string
          answer_km?: string | null
          answer_en?: string | null
          category?: string
          display_order?: number
          is_published?: boolean
          approval_status?: 'draft' | 'pending_review' | 'published' | 'rejected'
          created_at?: string
          updated_at?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      news_tags: {
        Row: {
          news_id: string
          tag_id: string
          tenant_id: string | null
        }
        Insert: {
          news_id: string
          tag_id: string
          tenant_id?: string | null
        }
        Update: {
          news_id?: string
          tag_id?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      media_tags: {
        Row: {
          media_id: string
          tag_id: string
          tenant_id: string | null
        }
        Insert: {
          media_id: string
          tag_id: string
          tenant_id?: string | null
        }
        Update: {
          media_id?: string
          tag_id?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      learning_resource_tags: {
        Row: {
          learning_resource_id: string
          tag_id: string
          tenant_id: string | null
        }
        Insert: {
          learning_resource_id: string
          tag_id: string
          tenant_id?: string | null
        }
        Update: {
          learning_resource_id?: string
          tag_id?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          subject: string | null
          message: string
          status: 'unread' | 'read' | 'replied'
          created_at: string
          replied_at: string | null
          replied_by: string | null
          tenant_id: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          subject?: string | null
          message: string
          status?: 'unread' | 'read' | 'replied'
          created_at?: string
          replied_at?: string | null
          replied_by?: string | null
          tenant_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          subject?: string | null
          message?: string
          status?: 'unread' | 'read' | 'replied'
          created_at?: string
          replied_at?: string | null
          replied_by?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          action: string
          resource: string
          resource_id: string | null
          changes: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          table_name: string | null
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          tenant_id: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action: string
          resource: string
          resource_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          tenant_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          id: string
          domain: string
          name: string
          subdomain: string | null
          layout_style: string | null
          theme_colors: Json | null
          logo_url: string | null
          contact_info: Json | null
          created_at: string
          layout_blocks: Json | null
          modules_config: Json | null
          has_web_frontend: boolean
          latitude: number | null
          longitude: number | null
          geog: any | null
          parent_id: string | null
          centralized_finance: boolean
          nav_visibility: Json | null
          tenant_type: string
          plan_type: string
          lifecycle_status: string
        }
        Insert: {
          id?: string
          domain: string
          name: string
          subdomain?: string | null
          layout_style?: string | null
          theme_colors?: Json | null
          logo_url?: string | null
          contact_info?: Json | null
          created_at?: string
          layout_blocks?: Json | null
          modules_config?: Json | null
          has_web_frontend?: boolean
          latitude?: number | null
          longitude?: number | null
          geog?: any | null
          parent_id?: string | null
          centralized_finance?: boolean
          nav_visibility?: Json | null
          tenant_type?: string
          plan_type?: string
          lifecycle_status?: string
        }
        Update: {
          id?: string
          domain?: string
          name?: string
          subdomain?: string | null
          layout_style?: string | null
          theme_colors?: Json | null
          logo_url?: string | null
          contact_info?: Json | null
          created_at?: string
          layout_blocks?: Json | null
          modules_config?: Json | null
          has_web_frontend?: boolean
          latitude?: number | null
          longitude?: number | null
          geog?: any | null
          parent_id?: string | null
          centralized_finance?: boolean
          nav_visibility?: Json | null
          tenant_type?: string
          plan_type?: string
          lifecycle_status?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          preferred_tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          preferred_tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          preferred_tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      tenant_members: {
        Row: {
          id: string
          user_id: string
          tenant_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_member_roles: {
        Row: {
          member_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          member_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          member_id?: string
          role_id?: string
          created_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          role_id: string
          resource: string
          can_create: boolean
          can_read: boolean
          can_update: boolean
          can_delete: boolean
        }
        Insert: {
          role_id: string
          resource: string
          can_create?: boolean
          can_read?: boolean
          can_update?: boolean
          can_delete?: boolean
        }
        Update: {
          role_id?: string
          resource?: string
          can_create?: boolean
          can_read?: boolean
          can_update?: boolean
          can_delete?: boolean
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          id: string
          ip: string
          tenant_id: string | null
          blocked_until: string
          reason: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          ip: string
          tenant_id?: string | null
          blocked_until: string
          reason?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          ip?: string
          tenant_id?: string | null
          blocked_until?: string
          reason?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      rate_limit_hits: {
        Row: {
          ip_address: string
          action_type: string
          hit_count: number
          last_hit: string
          tenant_id: string | null
          identifier: string
          action: string
        }
        Insert: {
          ip_address: string
          action_type: string
          hit_count?: number
          last_hit?: string
          tenant_id?: string | null
          identifier: string
          action: string
        }
        Update: {
          ip_address?: string
          action_type?: string
          hit_count?: number
          last_hit?: string
          tenant_id?: string | null
          identifier?: string
          action?: string
        }
        Relationships: []
      }
      active_visitors: {
        Row: {
          id: string
          session_hash: string
          path: string
          last_active_at: string
        }
        Insert: {
          id?: string
          session_hash: string
          path: string
          last_active_at?: string
        }
        Update: {
          id?: string
          session_hash?: string
          path?: string
          last_active_at?: string
        }
        Relationships: []
      }
      user_activity_baselines: {
        Row: {
          id: string
          user_email: string
          avg_hourly_actions: number
          stddev_hourly_actions: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_email: string
          avg_hourly_actions?: number
          stddev_hourly_actions?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          avg_hourly_actions?: number
          stddev_hourly_actions?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
