const { createClient } = require('@supabase/supabase-js');

// Hardcode the values for testing
const supabaseUrl = 'https://tvtwdvpsyjqxxcoobqbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dHdkdnBzeWpxeHhjb29icWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDIyNjksImV4cCI6MjA3MzIxODI2OX0.PkuuinHw1OpAGjlOr2bw_iyTxo8OykJNqM6faWWVkQM';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  try {
    console.log('\n🔍 Testing Supabase connection...');
    
    // Test 1: Check if we can access storage
    console.log('\n📦 Testing storage access...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error accessing storage:', bucketsError.message);
      return;
    }
    
    console.log('✅ Storage accessible');
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Test 2: Check if images bucket exists
    const imagesBucket = buckets.find(b => b.name === 'images');
    if (!imagesBucket) {
      console.error('❌ Images bucket not found!');
      console.log('Please create an "images" bucket in your Supabase dashboard');
      return;
    }
    
    console.log('✅ Images bucket found');
    
    // Test 3: List files in images bucket
    console.log('\n📁 Testing file listing...');
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('newsfeed', { limit: 10 });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError.message);
      return;
    }
    
    console.log('✅ File listing works');
    console.log('Files in newsfeed folder:', files.length);
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.size} bytes)`);
    });
    
    // Test 4: Test public URL generation
    if (files.length > 0) {
      console.log('\n🔗 Testing public URL generation...');
      const testFile = files[0];
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(`newsfeed/${testFile.name}`);
      
      console.log('✅ Public URL generated');
      console.log('Test URL:', publicUrl);
      
      // Test if URL is accessible
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('✅ URL is accessible');
        } else {
          console.log('⚠️ URL returned status:', response.status);
        }
      } catch (error) {
        console.log('⚠️ Could not test URL accessibility:', error.message);
      }
    }
    
    console.log('\n🎉 Supabase test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabase();
