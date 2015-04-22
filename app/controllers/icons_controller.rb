class IconsController < ApplicationController

  def index
		icon_files = Dir.glob("#{Rails.root}/app/assets/images/icons/*.png").sort
		icon_files.each do |i|
			i.gsub!("#{Rails.root}/app/assets/images/icons/", "")
		end
		@icons = icon_files.paginate(per_page: 100, page: params[:page])
		render :layout => false
  end



	def create
		uploaded_io = params[:picture]
		if uploaded_io != nil then
			File.open(Rails.root.join('public', 'images', uploaded_io.original_filename), 'wb') do |file|
				file.write(uploaded_io.read)
			end
			image = ActionController::Base.helpers.asset_path('images/'+ uploaded_io.original_filename)
			puts image
			render :json => { success: "true", message: image }
		else
			render :nothing => true
		end
  end

end
