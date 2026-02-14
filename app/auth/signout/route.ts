import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const requestOrigin = new URL(req.url).origin
  if (origin && origin !== requestOrigin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  });
}
