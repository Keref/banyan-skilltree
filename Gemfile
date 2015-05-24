source 'https://rubygems.org'
ruby '2.1.6'

gem 'rails',                   '4.2.0'
gem 'bcrypt',                  '3.1.7'
gem 'faker',                   '1.4.2'
gem 'will_paginate',           '3.0.7'
gem 'sass-rails',              '5.0.1'
gem 'bootstrap-sass',          '3.2.0.0'
gem 'uglifier',                '2.5.3'
gem 'jquery-rails',            '4.0.3'
gem 'jbuilder',                '2.2.3'
gem 'coffee-rails', '4.1.0'
gem 'simple_form'
gem 'sdoc',                    '0.4.0', group: :doc
gem 'acts-as-taggable-on',     '~> 3.4'
gem 'forem', :github => "radar/forem", :branch => "rails4"
gem 'forem-bootstrap', github: "radar/forem-bootstrap"
gem 'ratyrate', :github => 'wazery/ratyrate', :branch => 'master'
gem "carrierwave"


group :test do
  gem 'sqlite3',     '1.3.9'
  gem 'minitest-reporters', '1.0.5'
  gem 'mini_backtrace',     '0.1.3'
  gem 'guard-minitest',     '2.3.1'
end

group :test, :development do
  gem 'byebug',      '3.4.0'
  gem 'web-console', '2.0.0.beta3'
  gem 'spring',      '1.1.3'
end

group :development do
end

group :development, :production do
  gem 'pg',          '0.17.1'
end

group :production do
  gem 'rails_12factor', '0.0.2'
  gem 'unicorn',        '4.8.3'
  gem 'puma',           '2.11.1'
end
