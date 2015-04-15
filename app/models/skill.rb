class Skill < ActiveRecord::Base
  belongs_to :node
  belongs_to :user
  validates :user, presence: true
  validates :node, presence: true
  after_initialize :init_default_vars
  
   private
		
		def init_default_vars
			self.lvl ||= 0
		end
end
