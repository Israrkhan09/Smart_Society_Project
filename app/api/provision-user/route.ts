import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FIREBASE_API_KEY = "AIzaSyDIjWqYMHVfVOpJD9bf1xDtSA17RrxxkdQ";
const FIREBASE_PROJECT_ID = "smart-neighboor";

// Server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, unit, role, shift, password } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields: name, email, password" }, { status: 400 });
    }

    // ── STEP 1: Create Firebase Auth user via REST API ──────────────────────
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const firebaseData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      const msg = firebaseData?.error?.message || "Firebase user creation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { localId: uid, idToken } = firebaseData;

    // ── STEP 2: Write role to Firestore via REST API ─────────────────────────
    // Using the newly created user's idToken to bypass basic unauthorized restrictions
    const firestoreRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`,
      {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          fields: {
            uid:       { stringValue: uid },
            email:     { stringValue: email },
            name:      { stringValue: name },
            role:      { stringValue: role || "resident" },
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      }
    );

    if (!firestoreRes.ok) {
      const fsData = await firestoreRes.json();
      console.error("Firestore write failed:", fsData);
      return NextResponse.json({ error: "Failed to map user role in database" }, { status: 400 });
    }

    // ── STEP 3: Store profile in Supabase residents table ────────────────────
    const { error: supabaseError } = await supabase
      .from("residents")
      .insert([{
        name,
        email,
        phone: phone || null,
        unit: unit || null,
        status: "active",
        role: role || "resident",
        joined_date: new Date().toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        }),
      }]);

    if (supabaseError) {
      console.error("Supabase insert failed:", supabaseError.message);
      // Non-fatal — user is already created in Firebase
    }

    return NextResponse.json({
      success: true,
      uid,
      message: `${role || "resident"} account created successfully.`,
    });

  } catch (err: any) {
    console.error("Provision user error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
