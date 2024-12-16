import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import type { SubscriptionTier } from "@/integrations/supabase/types/subscription"

export function SubscriptionButton() {
  const { user } = useAuth()
  const { toast } = useToast()

  const { data: subscriptionTier } = useQuery({
    queryKey: ['subscriptionTier'],
    queryFn: async () => {
      console.log('Fetching subscription tier')
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('name', 'premium')
        .single()
      
      if (error) {
        console.error('Error fetching subscription tier:', error)
        throw error
      }

      console.log('Raw subscription tier data:', data)
      
      if (!data) {
        console.error('No subscription tier found')
        throw new Error('No subscription tier found')
      }

      return data as SubscriptionTier
    },
    enabled: !!user,
    retry: false
  })

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to subscribe",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Starting subscription process for user:', user.id)
      console.log('Using subscription tier:', subscriptionTier)
      
      if (!subscriptionTier?.price_id) {
        console.error('No subscription tier found')
        toast({
          title: "Subscription Error",
          description: "No subscription tier found. Please try again later.",
          variant: "destructive",
        })
        return
      }

      // If price_id is a URL, redirect directly to it
      if (subscriptionTier.price_id.startsWith('http')) {
        window.location.href = subscriptionTier.price_id
        return
      }

      // Otherwise, use the original Stripe checkout flow
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: subscriptionTier.price_id,
          userId: user.id,
          tierId: subscriptionTier.id
        }
      })

      if (error) {
        console.error('Error creating checkout session:', error)
        toast({
          title: "Subscription Error",
          description: "Failed to start subscription process. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (!data?.url) {
        console.error('No checkout URL returned:', data)
        toast({
          title: "Subscription Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        })
        return
      }

      console.log('Redirecting to checkout URL:', data.url)
      window.location.href = data.url
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to start subscription process. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button 
      onClick={handleSubscribe}
      className="bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90"
    >
      {user ? "Upgrade to Premium" : "Join the Family for $1/month!"}
    </Button>
  )
}