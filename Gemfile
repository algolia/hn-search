source 'https://rubygems.org'

ruby '2.0.0'

gem 'rails', '4.0.0'
gem 'sass-rails', '~> 4.0.0'
gem 'uglifier', '>= 1.3.0'
gem 'jquery-rails'
gem 'jbuilder', '~> 1.2'
gem 'figaro'
gem 'haml-rails'
gem 'bourbon'
gem 'therubyracer'
gem 'hogan_assets'

gem 'algoliasearch-rails'
gem 'curb'
gem 'aws-s3'
gem 'open_uri_redirections'
gem 'simple_enum'
gem 'whenever'
gem 'thin'
gem 'rails-api'
gem 'active_model_serializers', github: "rails-api/active_model_serializers"
gem 'delayed_job_active_record'
gem 'groupdate', git: 'https://github.com/mieko/groupdate.git', branch: 'sqlite3'

group :development do
  gem 'sqlite3'
  gem 'better_errors'
  gem 'binding_of_caller', :platforms=>[:mri_19, :mri_20, :rbx]
  gem 'html2haml'
  gem 'quiet_assets'
  gem 'rails_layout'
end
group :production do
  gem 'mysql2'
end
group :development, :test do
  gem 'factory_girl_rails'
end
group :test do
  gem 'capybara'
  gem 'minitest-spec-rails'
  gem 'minitest-wscolor'
end
