const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://tvtwdvpsyjqxxcoobqbz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dHdkdnBzeWpxeHhjb29icWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NDIyNjksImV4cCI6MjA3MzIxODI2OX0.PkuuinHw1OpAGjlOr2bw_iyTxo8OykJNqM6faWWVkQM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupSupabaseStorage() {
  try {
    console.log('🚀 Setting up Supabase Storage...\n');

    // Step 1: Create the images bucket
    console.log('📦 Creating images bucket...');
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Images bucket already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError.message);
        return;
      }
    } else {
      console.log('✅ Images bucket created successfully');
    }

    // Step 2: List buckets to verify
    console.log('\n📋 Verifying bucket creation...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    console.log('✅ Available buckets:', buckets.map(b => b.name));

    // Step 3: Test upload
    console.log('\n🧪 Testing file upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageData, 'base64');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload('test/test-image.png', testImageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError.message);
      return;
    }

    console.log('✅ Test file uploaded successfully');
    console.log('📁 Upload path:', uploadData.path);

    // Step 4: Test public URL generation
    console.log('\n🔗 Testing public URL generation...');
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl('test/test-image.png');

    console.log('✅ Public URL generated:', publicUrl);

    // Step 5: Test URL accessibility
    console.log('\n🌐 Testing URL accessibility...');
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ URL is accessible (status:', response.status + ')');
      } else {
        console.log('⚠️ URL returned status:', response.status);
      }
    } catch (error) {
      console.log('⚠️ Could not test URL accessibility:', error.message);
    }

    // Step 6: Clean up test file
    console.log('\n🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove(['test/test-image.png']);

    if (deleteError) {
      console.log('⚠️ Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Supabase Storage setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage > Policies');
    console.log('3. Create these policies for the "images" bucket:');
    console.log('\n   Policy 1 - Public Read Access:');
    console.log('   CREATE POLICY "Public read access" ON storage.objects');
    console.log('   FOR SELECT USING (bucket_id = \'images\');');
    console.log('\n   Policy 2 - Authenticated Upload:');
    console.log('   CREATE POLICY "Authenticated users can upload" ON storage.objects');
    console.log('   FOR INSERT WITH CHECK (bucket_id = \'images\');');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupSupabaseStorage();
