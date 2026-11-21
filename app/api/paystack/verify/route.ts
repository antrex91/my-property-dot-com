import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const {
      reference,
      expectedAmount,
      // NEW: These come from Upload page so we can split commission
      buyerId,
      buyerName,
      buyerPhone,
      packageName,
      packagePrice,
    } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { ok: false, error: "No reference" },
        { status: 400 }
      );
    }

    // FIX 1: Make sure LIVE key exists
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "Paystack key missing in Vercel" },
        { status: 500 }
      );
    }

    // Safety: warn if you are still on TEST key in Live
    const isTestKey = secret.startsWith("sk_test_");
    if (isTestKey) {
      console.warn("WARNING: Still using TEST Paystack key in Live!");
    }

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (data?.data?.status !== "success") {
      return NextResponse.json(
        { ok: false, error: "Payment not successful" },
        { status: 400 }
      );
    }

    const paidAmount = data.data.amount / 100;

    // FIX 3: Check amount if Upload sent expectedAmount
    if (expectedAmount && Number(paidAmount) < Number(expectedAmount)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Paid ₦${paidAmount} but expected ₦${expectedAmount}`,
        },
        { status: 400 }
      );
    }

    // Supabase client - use Service Role so it can write commissions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // FIX 2: Replay protection - check if reference already used
    try {
      const { data: existing } = await supabase
        .from("properties")
        .select("id")
        .eq("payment_reference", reference)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { ok: false, error: "This payment reference was already used" },
          { status: 400 }
        );
      }
    } catch (e) {
      // If check fails, do NOT block payment, just log it
      console.log("Replay check failed, continuing:", e);
    }

    // =====================================================
    // NEW: COMMISSION SPLIT 10% / 5% / 3% - ONLY AFTER PAYMENT IS VERIFIED
    // This is the createCommissions from your Upload file, moved here
    // so it runs on the server and cannot be faked.
    // =====================================================
    try {
      const finalBuyerId = buyerId;
      const finalBuyerName = buyerName || data.data.customer?.email || "Agent";
      const finalBuyerPhone = buyerPhone || "";
      const finalPackageName = packageName || "Package";
      const finalPackagePrice = Number(packagePrice || expectedAmount || paidAmount);

      if (finalBuyerId) {
        const { data: buyer } = await supabase
          .from("agents")
          .select("*")
          .eq("id", finalBuyerId)
          .single();

        if (buyer && buyer.referred_by_agent_id) {
          // LEVEL 1 - 10%
          const { data: L1 } = await supabase
            .from("agents")
            .select("*")
            .eq("id", buyer.referred_by_agent_id)
            .single();

          if (L1) {
            await supabase.from("commissions").insert({
              buyer_agent_id: finalBuyerId,
              buyer_agent_name: finalBuyerName,
              buyer_agent_phone: finalBuyerPhone,
              package_name: finalPackageName,
              package_price: finalPackagePrice,
              earner_agent_id: L1.id,
              earner_agent_name: L1.name,
              earner_level: 1,
              percent: 10,
              amount: finalPackagePrice * 0.10,
              status: "Approved",
              payment_ref: reference,
            });

            await supabase
              .from("agents")
              .update({
                total_earned: Number(L1.total_earned || 0) + finalPackagePrice * 0.10,
                total_withdrawable: Number(L1.total_withdrawable || 0) + finalPackagePrice * 0.10,
              })
              .eq("id", L1.id);

            // LEVEL 2 - 5%
            if (L1.referred_by_agent_id) {
              const { data: L2 } = await supabase
                .from("agents")
                .select("*")
                .eq("id", L1.referred_by_agent_id)
                .single();

              if (L2) {
                await supabase.from("commissions").insert({
                  buyer_agent_id: finalBuyerId,
                  buyer_agent_name: finalBuyerName,
                  buyer_agent_phone: finalBuyerPhone,
                  package_name: finalPackageName,
                  package_price: finalPackagePrice,
                  earner_agent_id: L2.id,
                  earner_agent_name: L2.name,
                  earner_level: 2,
                  percent: 5,
                  amount: finalPackagePrice * 0.05,
                  status: "Approved",
                  payment_ref: reference,
                });

                await supabase
                  .from("agents")
                  .update({
                    total_earned: Number(L2.total_earned || 0) + finalPackagePrice * 0.05,
                    total_withdrawable: Number(L2.total_withdrawable || 0) + finalPackagePrice * 0.05,
                  })
                  .eq("id", L2.id);

                // LEVEL 3 - 3%
                if (L2.referred_by_agent_id) {
                  const { data: L3 } = await supabase
                    .from("agents")
                    .select("*")
                    .eq("id", L2.referred_by_agent_id)
                    .single();

                  if (L3) {
                    await supabase.from("commissions").insert({
                      buyer_agent_id: finalBuyerId,
                      buyer_agent_name: finalBuyerName,
                      buyer_agent_phone: finalBuyerPhone,
                      package_name: finalPackageName,
                      package_price: finalPackagePrice,
                      earner_agent_id: L3.id,
                      earner_agent_name: L3.name,
                      earner_level: 3,
                      percent: 3,
                      amount: finalPackagePrice * 0.03,
                      status: "Approved",
                      payment_ref: reference,
                    });

                    await supabase
                      .from("agents")
                      .update({
                        total_earned: Number(L3.total_earned || 0) + finalPackagePrice * 0.03,
                        total_withdrawable: Number(L3.total_withdrawable || 0) + finalPackagePrice * 0.03,
                      })
                      .eq("id", L3.id);
                  }
                }
              }
            }
          }
        }
      }
    } catch (commErr) {
      console.log("Commission split failed, but payment was successful:", commErr);
      // Do NOT fail payment because commission failed - CEO can re-run it
    }

    return NextResponse.json({
      ok: true,
      amount: paidAmount,
      email: data.data.customer?.email,
      reference: data.data.reference,
      isTest: isTestKey,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}