import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import type { SubscriptionTier } from "@/integrations/supabase/types/subscription"

export function SubscriptionButton() {
  const { user } = useAuth()
  const { toast } = useToast()

  const { data: subscriptionTier, isLoading } = useQuery<SubscriptionTier>({
    queryKey: ['subscriptionTier'],
    queryFn: async () => {
      console.log('Fetching subscription tier')
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .single()
      
      if (error) {
        console.error('Error fetching subscription tier:', error)
        throw error
      }
      console.log('Fetched subscription tier:', data)
      return data as SubscriptionTier
    },
    enabled: !!user,
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
      console.log('Creating checkout session for user:', user.id)
      console.log('Using subscription tier:', subscriptionTier)
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: subscriptionTier?.price_id,
          userId: user.id,
          tierId: subscriptionTier?.id
        }
      })

      if (error) {
        console.error('Error response:', error)
        throw error
      }

      if (!data?.url) {
        console.error('No URL in response:', data)
        throw new Error('No checkout URL returned')
      }

      console.log('Redirecting to checkout URL:', data.url)
      window.location.href = data.url
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start subscription process",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleSubscribe}
      variant="ghost"
      className="border border-gray-200 dark:border-gray-700 text-foreground hover:bg-[linear-gradient(-45deg,#008C45_25%,#F4F9FF_50%,#CD212A_75%)] hover:text-gray-700 hover:border-transparent transition-all duration-700"
    >
      {user ? "Upgrade to Premium" : "Join the Family for $1/month!"}
    </Button>
  )
}