import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import type { UserSubscription } from "@/integrations/supabase/types/subscription"

const isValidStatus = (status: string): status is UserSubscription['status'] => {
  return ['active', 'canceled', 'past_due', 'trialing'].includes(status)
}

export function useSubscription() {
  const { user } = useAuth()

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      console.log('Fetching subscription for user:', user?.id)
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          status,
          stripe_subscription_id,
          stripe_customer_id,
          current_period_start,
          current_period_end,
          created_at,
          subscription_tier_id
        `)
        .eq('user_id', user?.id)
        .single()

      if (error) {
        console.error('Subscription fetch error:', error)
        return null
      }
      
      console.log('Fetched subscription data:', data)
      
      if (!data) return null

      if (!isValidStatus(data.status)) {
        console.error(`Invalid subscription status: ${data.status}`)
        return null
      }

      return data as UserSubscription
    },
    enabled: !!user,
  })

  const isSubscribed = subscription?.status === 'active'
  
  return {
    subscription,
    isLoading,
    isSubscribed,
  }
}