class Tree 
  # a tree possesses many nodes and many links
  
	# createNodeTree saves a whole tree as a transaction
	# param: { node: { node0: {...}, ...}, link: { link0: { ...}, ... } }
	
	def initialize(item_name)
    @item_name = item_name
  end
  
  
  #creates a tree: instantiates a table of nodes and links
  def createNodeTree (param)

  end
  
  
  
  # save the graph in the database with a transaction to avoid corrupted versions
  def save
		
  end
  
  
  # getNodeTree: takes the id of a node and returns a subtree of an arbitrary maximum depth
  def getNodeTree( node_id, depth = 0 )
  
  end
end
