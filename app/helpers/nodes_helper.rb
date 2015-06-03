module NodesHelper

	#returns a select box with available style to choose from
	def select_style ( style_selected )
		css_styles = Dir.glob("#{Rails.root}/public/treestyle/*.scss")
		#we want an array of pairs [CSSname, css_filename] for our select_tag
		css_styles.map! {|s| [ s.gsub!("#{Rails.root}/public/treestyle/", '').gsub!(/.css.scss$/,""), asset_url(s+".css") ] }

		default_style_url = asset_url(style_selected.blank? ? "default.css" : style_selected ) 
		puts "style: ", default_style_url
		select_tag  "tree_style_select", options_for_select(css_styles, default_style_url)
	end
end
