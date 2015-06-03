# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )
#Rails.application.config.assets.precompile += %w( jquery.js )
#Rails.application.config.assets.precompile += %w( jquery-ui.min.js )
#Rails.application.config.assets.precompile += %w( jquery.jsPlumb.js )
#Rails.application.config.assets.precompile += %w( banyanTree.js )
Rails.application.config.assets.precompile += %w( forem.css )
Rails.application.config.assets.precompile += %w( forem.js )
Rails.application.config.assets.precompile += %w( default.css treestyle/* )
Rails.application.config.assets.precompile += %w( tileable_wood.css tileable_wood_texture.jpg )
