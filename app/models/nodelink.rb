class Nodelink < ActiveRecord::Base
  belongs_to :node
  has_one :node
  validates :name, presence: true, length: { maximum: 80 }
  validates :node_id, presence: true
  validates :targetnode_id, presence: true
  attr_accessor :parent_node, :target_node, :update_key
  
  # nodes are to be filled 
  #@node_id = nil
  #@targetnode_id = nil
  #type of link can be: normal, include, attribute, #number_in_#identifier...
  #TODO: exhaustive description of structure and terms in a separate file

  
    private
		
		def init_default_vars
			self.content ||= " "
			self.update_key ||= "save"
			@link_type = "normal"
		end
end
