class Nodelink < ActiveRecord::Base
  belongs_to :node
  has_one :node
  validates :name, presence: true, length: { maximum: 80 }
  validates :parent_node, presence: true
  validates :child_node, presence: true
  
  # nodes are to be filled 
  @parent_node = nil
  @child_node = nil
  #type of link can be: normal, include, attribute, #number_in_#identifier...
  #TODO: exhaustive description of structure and terms in a separate file
  @link_type = "normal"
  
  
end
