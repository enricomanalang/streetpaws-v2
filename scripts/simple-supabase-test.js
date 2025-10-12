const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tvtwdvpsyjqxxcoobqbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dHdkdnBzeWpxeHhjb29icWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDIyNjksImV4cCI6MjA3MzIxODI2OX0.PkuuinHw1OpAGjlOr2bw_iyTxo8OykJNqM6faWWVkQM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simpleTest() {
  try {
    console.log('🧪 Simple Supabase Test...\n');

    // Test 1: List buckets
    console.log('📦 Listing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error:', bucketsError.message);
      return;
    }

    console.log('✅ Buckets found:', buckets.length);
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (Public: ${bucket.public})`);
    });

    if (buckets.length === 0) {
      console.log('❌ No buckets found!');
      return;
    }

    // Test 2: Try to list files in images bucket
    console.log('\n📁 Listing files in images bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('images')
      .list('newsfeed', { limit: 10 });

    if (filesError) {
      console.error('❌ Error listing files:', filesError.message);
    } else {
      console.log('✅ Files in newsfeed folder:', files.length);
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.size} bytes)`);
      });
    }

    // Test 3: Try to upload a simple file
    console.log('\n⬆️ Testing upload...');
    const testContent = 'Hello World!';
    const fileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`newsfeed/${fileName}`, testContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
    } else {
      console.log('✅ Upload successful!');
      console.log('📁 Path:', uploadData.path);
      
      // Test 4: Generate public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(`newsfeed/${fileName}`);
      
      console.log('🔗 Public URL:', publicUrl);
      
      // Test 5: Try to download the file
      try {
        const response = await fetch(publicUrl);
        if (response.ok) {
          const content = await response.text();
          console.log('✅ File downloaded successfully:', content);
        } else {
          console.log('⚠️ Download failed:', response.status);
        }
      } catch (error) {
        console.log('⚠️ Download error:', error.message);
      }
      
      // Clean up
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([`newsfeed/${fileName}`]);
      
      if (deleteError) {
        console.log('⚠️ Could not delete test file:', deleteError.message);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest();
