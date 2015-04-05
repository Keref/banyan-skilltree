class Skill < ActiveRecord::Base
  belongs_to :node
  belongs_to :user
  validates :user, presence: true
  validates :node, presence: true
  after_initialize :init_default_vars
  
  
   private
		
		def init_default_vars
			self.level ||= 1
		end
end
