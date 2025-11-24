const { createClient } = require('@supabase/supabase-js');

// Uses the UNPREFIXED environment variables automatically set by Netlify's Supabase integration.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Main Netlify Function Handler
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. Parse the JSON data sent from the frontend script
    const data = JSON.parse(event.body);
    const { type, ip, country, region, city, latitude, longitude, isp } = data;
    
    // 2. Insert the data into the 'location_logs' table
    const { error } = await supabase
      .from('location_logs') // <-- Ensure 'location_logs' is your exact table name!
      .insert([
        { 
          type: type,
          ip: ip,
          latitude: latitude,
          longitude: longitude,
          city_info: `${city}, ${region}, ${country} (${isp})`
        }
      ]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Database Write Failed', details: error.message }) };
    }

    // Success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Location logged successfully' })
    };

  } catch (parseError) {
    // Error handling for bad data or parsing issues
    console.error('Payload Parsing Error:', parseError);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid payload received' }) };
  }
};
