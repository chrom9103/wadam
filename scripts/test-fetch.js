/*
  Local test script for fetching "my trips" and trip members using
  Supabase service role key. Use only for local development/testing.

  Usage:
    SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=ey... USER_ID=<uuid> node scripts/test-fetch.js

  Or provide TRIP_ID to fetch members for a specific trip:
    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... USER_ID=... TRIP_ID=... node scripts/test-fetch.js
*/

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
const USER_ID = process.env.USER_ID
const TRIP_ID = process.env.TRIP_ID // optional

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}
if (!USER_ID) {
  console.error('Provide USER_ID env var for which to fetch trips (example: USER_ID=<uuid>)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

async function fetchMyTrips(userId) {
  // 1. get trip_ids from trip_members
  const { data: tms, error: tmErr } = await supabase
    .from('trip_members')
    .select('trip_id')
    .eq('user_id', userId)

  if (tmErr) throw tmErr
  const tripIds = (tms || []).map(r => r.trip_id)
  if (tripIds.length === 0) return []

  // 2. fetch trips
  const { data: trips, error: tripsErr } = await supabase
    .from('trips')
    .select('id, title, start_date, end_date, created_by')
    .in('id', tripIds)
    .order('start_date', { ascending: false })

  if (tripsErr) throw tripsErr
  return trips
}

async function fetchTripMembers(tripId) {
  const { data: tms, error: tmErr } = await supabase
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', tripId)

  if (tmErr) throw tmErr
  const userIds = (tms || []).map(r => r.user_id)
  if (userIds.length === 0) return []

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds)

  if (profErr) throw profErr
  return profiles
}

;(async () => {
  try {
    console.log('Fetching trips for user:', USER_ID)
    const trips = await fetchMyTrips(USER_ID)
    console.log('Trips:', JSON.stringify(trips, null, 2))

    if (TRIP_ID) {
      console.log('\nFetching members for trip:', TRIP_ID)
      const members = await fetchTripMembers(TRIP_ID)
      console.log('Members:', JSON.stringify(members, null, 2))
    } else if (trips && trips.length > 0) {
      console.log('\nFetching members for first trip (for convenience)')
      const members = await fetchTripMembers(trips[0].id)
      console.log('Members:', JSON.stringify(members, null, 2))
    }

    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message || err)
    process.exit(2)
  }
})()
