AWS::S3::Base.establish_connection!(access_key_id: ENV['AMAZON_ACCESS_KEY_ID'], secret_access_key: ENV['AMAZON_SECRET_ACCESS_KEY']) if !ENV['AMAZON_ACCESS_KEY_ID'].blank?
