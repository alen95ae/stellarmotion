import { NextResponse } from "next/server"

export async function GET() {
  try {
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_SOPORTES}`;
    
    console.log('🔍 Debugging Airtable connection...');
    console.log('📡 API URL:', AIRTABLE_API_URL);
    console.log('🔑 API Key:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Not set');
    console.log('🏠 Base ID:', process.env.AIRTABLE_BASE_ID ? 'Set' : 'Not set');
    console.log('📋 Table:', process.env.AIRTABLE_TABLE_SOPORTES ? 'Set' : 'Not set');
    
    const response = await fetch(AIRTABLE_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Airtable error:', errorText);
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        url: AIRTABLE_API_URL
      });
    }

    const data = await response.json();
    console.log(`✅ Found ${data.records.length} records`);
    
    // Analizar los campos del primer registro
    const firstRecord = data.records[0];
    const fields = firstRecord?.fields || {};
    const fieldNames = Object.keys(fields);
    
    console.log('📋 Available fields in Airtable:');
    fieldNames.forEach(field => {
      console.log(`  - "${field}": ${typeof fields[field]} = ${JSON.stringify(fields[field])}`);
    });
    
    return NextResponse.json({
      success: true,
      recordCount: data.records.length,
      sampleRecord: {
        id: firstRecord?.id,
        fields: fields
      },
      fieldNames: fieldNames,
      url: AIRTABLE_API_URL
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
