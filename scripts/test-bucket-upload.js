const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tvtwdvpsyjqxxcoobqbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dHdkdnBzeWpxeHhjb29icWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDIyNjksImV4cCI6MjA3MzIxODI2OX0.PkuuinHw1OpAGjlOr2bw_iyTxo8OykJNqM6faWWVkQM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBucketUpload() {
  try {
    console.log('🧪 Testing bucket upload...\n');

    // Step 1: List buckets
    console.log('📦 Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    console.log('✅ Available buckets:', buckets.map(b => b.name));

    if (buckets.length === 0) {
      console.log('❌ No buckets found! Please create a bucket manually in Supabase dashboard.');
      return;
    }

    // Step 2: Try to upload to each bucket
    for (const bucket of buckets) {
      console.log(`\n🔄 Testing upload to bucket: ${bucket.name}`);
      
      // Create a simple test image (1x1 pixel PNG)
      const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageData, 'base64');
      
      const fileName = `test-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket.name)
        .upload(`newsfeed/${fileName}`, testImageBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.log(`❌ Upload failed to ${bucket.name}:`, uploadError.message);
      } else {
        console.log(`✅ Upload successful to ${bucket.name}!`);
        console.log(`📁 Upload path: ${uploadData.path}`);
        
        // Test public URL generation
        const { data: { publicUrl } } = supabase.storage
          .from(bucket.name)
          .getPublicUrl(`newsfeed/${fileName}`);
        
        console.log(`🔗 Public URL: ${publicUrl}`);
        
        // Test URL accessibility
        try {
          const response = await fetch(publicUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log(`✅ URL is accessible (status: ${response.status})`);
          } else {
            console.log(`⚠️ URL returned status: ${response.status}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not test URL accessibility: ${error.message}`);
        }
        
        // Clean up
        const { error: deleteError } = await supabase.storage
          .from(bucket.name)
          .remove([`newsfeed/${fileName}`]);
        
        if (deleteError) {
          console.log(`⚠️ Could not delete test file: ${deleteError.message}`);
        } else {
          console.log(`✅ Test file cleaned up`);
        }
        
        console.log(`\n🎉 Bucket "${bucket.name}" is working correctly!`);
        console.log(`📝 Update your code to use bucket name: "${bucket.name}"`);
        break; // Stop after first successful upload
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBucketUpload();
