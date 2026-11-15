import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();
    if (!reference) return NextResponse.json({ ok: false, error: "No reference" }, { status: 400 });

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await res.json();

    if (data?.data?.status === "success") {
      return NextResponse.json({
        ok: true,
        amount: data.data.amount / 100,
        email: data.data.customer?.email,
        reference: data.data.reference,
      });
    }
    return NextResponse.json({ ok: false, error: "Payment not successful" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}