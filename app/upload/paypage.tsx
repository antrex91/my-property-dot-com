// Call this AFTER Paystack says payment is SUCCESS
const createCommissions = async (buyerId: string, buyerName: string, buyerPhone: string, packageName: string, packagePrice: number, paymentRef: string) => {
  // Get buyer to find his upline
  const { data: buyer } = await supabase.from("agents").select("*").eq("id", buyerId).single();
  if (!buyer || !buyer.referred_by_agent_id) return; // No inviter, no commission

  // LEVEL 1 - Direct - 10%
  const { data: L1 } = await supabase.from("agents").select("*").eq("id", buyer.referred_by_agent_id).single();
  if (L1) {
    await supabase.from("commissions").insert({ buyer_agent_id: buyerId, buyer_agent_name: buyerName, buyer_agent_phone: buyerPhone, package_name: packageName, package_price: packagePrice, earner_agent_id: L1.id, earner_agent_name: L1.name, earner_level: 1, percent: 10, amount: packagePrice * 0.10, status: "Approved", payment_ref: paymentRef });
    await supabase.from("agents").update({ total_earned: Number(L1.total_earned || 0) + packagePrice * 0.10, total_withdrawable: Number(L1.total_withdrawable || 0) + packagePrice * 0.10 }).eq("id", L1.id);

    // LEVEL 2 - 5%
    if (L1.referred_by_agent_id) {
      const { data: L2 } = await supabase.from("agents").select("*").eq("id", L1.referred_by_agent_id).single();
      if (L2) {
        await supabase.from("commissions").insert({ buyer_agent_id: buyerId, buyer_agent_name: buyerName, buyer_agent_phone: buyerPhone, package_name: packageName, package_price: packagePrice, earner_agent_id: L2.id, earner_agent_name: L2.name, earner_level: 2, percent: 5, amount: packagePrice * 0.05, status: "Approved", payment_ref: paymentRef });
        await supabase.from("agents").update({ total_earned: Number(L2.total_earned || 0) + packagePrice * 0.05, total_withdrawable: Number(L2.total_withdrawable || 0) + packagePrice * 0.05 }).eq("id", L2.id);

        // LEVEL 3 - 3%
        if (L2.referred_by_agent_id) {
          const { data: L3 } = await supabase.from("agents").select("*").eq("id", L2.referred_by_agent_id).single();
          if (L3) {
            await supabase.from("commissions").insert({ buyer_agent_id: buyerId, buyer_agent_name: buyerName, buyer_agent_phone: buyerPhone, package_name: packageName, package_price: packagePrice, earner_agent_id: L3.id, earner_agent_name: L3.name, earner_level: 3, percent: 3, amount: packagePrice * 0.03, status: "Approved", payment_ref: paymentRef });
            await supabase.from("agents").update({ total_earned: Number(L3.total_earned || 0) + packagePrice * 0.03, total_withdrawable: Number(L3.total_withdrawable || 0) + packagePrice * 0.03 }).eq("id", L3.id);
          }
        }
      }
    }
  }
};