class StaticPagesController < ApplicationController

  def home
		if current_user == nil
			render layout: 'home'
		end
  end

  def help
  end
  
  def about
  end

  def contact
  end
end
