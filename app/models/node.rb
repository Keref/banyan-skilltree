class Node < ActiveRecord::Base
  belongs_to :user
  has_many :nodelinks
  validates :user_id, presence: true
  validates :name, presence: true, length: { maximum: 80 }
  attr_accessor :link_list, :node_hash
  after_initialize :init_default_vars



	# createNodeTree creates a whole tree 
	# param: { node: { node0: {...}, ...}, link: { link0: { ...}, ... } }
  def createNodeTree (user, params)
  	# takes an array of param as sent by the post method
		# param: { node: { node0: {...}, ...}, link: { link0: { ...}, ... } , ...}
		
		# a tree is created from a root node, which is also the container, and a recursive structure of nodes and links
		# every node which doesn't have a parent get a default link to the root node, and is included inside the root node
		# TODO: allow defining this kind of relationship inside the graph, a node can contain others
		# TODO: charge params with each node/likn id being the one provided from the database
		@name = params["name"]

		#TODO: nodes indexed by name, so error if 2 nodes have the same name inside a tree
		#default main node, also called the Tree!
		root_node = Node.new(name: @name, user: user, nodetype: "graph", content: " ")
		@node_hash["graph"] = root_node
		#root_node.validate!

		# we first create the node instances and keep track of them in an array
		unless params["node"].blank? then
			params["node"].each do |oneNode| 
				n = Node.new(content: oneNode[1][:content]	, 
												name: oneNode[1][:title]			, 
										nodetype: oneNode[1][:nodetype]	, 
												user: user		)
				if ( offT = oneNode[1][:offsetTop] )
					n.offsetTop = offT
				end
				if ( offL = oneNode[1][:offsetLeft] )
					n.offsetLeft = offL
				end
				@node_hash[:"#{oneNode[0]}" ] = n
				
				#we want to create a default "include" link which defines that a node (the tree) includes others
				#basically, this is what a tree is, a node including a tree of nodes
				@link_list << Nodelink.new( node_id: self, targetnode_id: n, linktype: "include" )
			end
		end
		
		# we now create the link, and put each link in the right node.link_list
		unless params["link"].blank? then
			params["link"].each do |oneLink|
				parent_node = @node_hash[ :"#{oneLink[1]['sourceNode']}" ]
				child_node  = @node_hash[ :"#{oneLink[1]['targetNode']}" ]
				l = Nodelink.new(		node_id: parent_node,
															targetnode_id: child_node,
															linktype: "default")
				parent_node.add_link l
				puts l.id
			end
		end
  end
  
  #saves the whole tree, nodes and links and whatever content
  def save_tree
		transaction_succesful = false
		Node.transaction do
			save_tree_nodes
			#save_tree_links
			transaction_succesful = true
		end
	end
  
  #saves all the nodes from the tree
  def save_tree_nodes
  puts @node_hash
		@node_hash.each do |node_key, node|
			#we validate to make the transaction rollback in case of problem
			#for test: node.user = nil
			if !node.valid?
			puts "invalid node"
				raise ActiveRecord::Rollback
			end
			node.save
		end
  end
  
  #save all the links
  def save_tree_links
		@link_list.each do |link|
			link.save!
		end
	end
  
  #add a link to 
  def add_link(link)
		@link_list ||= []
		@link_list.push( link)
  end
  
  private
		
		def init_default_vars
			self.node_hash ||= {}
			self.link_list ||= []
		end
end
