class IconsController < ApplicationController

  def index
		icon_files = Dir.glob("#{Rails.root}/app/assets/images/icons/*.png").sort
		icon_files.each do |i|
			i.gsub!("#{Rails.root}/app/assets/images/icons/", "")
		end
		@icons = icon_files.paginate(per_page: 100, page: params[:page])
		render :layout => false
  end

end
