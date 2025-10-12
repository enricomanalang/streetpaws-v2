const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tvtwdvpsyjqxxcoobqbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dHdkdnBzeWpxeHhjb29icWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDIyNjksImV4cCI6MjA3MzIxODI2OX0.PkuuinHw1OpAGjlOr2bw_iyTxo8OykJNqM6faWWVkQM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createNewBucket() {
  try {
    console.log('🚀 Creating new Supabase bucket...\n');

    // Step 1: List existing buckets
    console.log('📦 Listing existing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    console.log('✅ Existing buckets:', buckets.map(b => b.name));

    // Step 2: Create new bucket
    const bucketName = 'images-new';
    console.log(`\n📦 Creating bucket: ${bucketName}...`);
    
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log(`✅ Bucket "${bucketName}" already exists`);
      } else {
        console.error('❌ Error creating bucket:', bucketError.message);
        return;
      }
    } else {
      console.log(`✅ Bucket "${bucketName}" created successfully`);
    }

    // Step 3: Test upload to new bucket
    console.log(`\n🧪 Testing upload to ${bucketName}...`);
    
    const testContent = 'Hello World!';
    const fileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`newsfeed/${fileName}`, testContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      return;
    }

    console.log('✅ Upload successful!');
    console.log('📁 Path:', uploadData.path);
    
    // Step 4: Generate public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`newsfeed/${fileName}`);
    
    console.log('🔗 Public URL:', publicUrl);
    
    // Step 5: Test URL accessibility
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        const content = await response.text();
        console.log('✅ URL is accessible:', content);
      } else {
        console.log('⚠️ URL returned status:', response.status);
      }
    } catch (error) {
      console.log('⚠️ Could not test URL accessibility:', error.message);
    }
    
    // Step 6: Clean up
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([`newsfeed/${fileName}`]);
    
    if (deleteError) {
      console.log('⚠️ Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log(`\n🎉 Bucket "${bucketName}" is working correctly!`);
    console.log(`📝 Update your code to use bucket name: "${bucketName}"`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

createNewBucket();
