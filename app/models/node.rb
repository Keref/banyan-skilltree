class Node < ActiveRecord::Base
  belongs_to :user
  has_many :nodelinks #, :dependent => :destroy
  validates :user_id, presence: true
  validates :name, presence: true, length: { maximum: 80 }
  attr_accessor :link_hash, :node_hash, :update_key, :save_error
  after_initialize :init_default_vars



	# createNodeTree creates a whole tree from a standard tree
	# param: { node: { node0: {...}, ...}, link: { link0: { ...}, ... } }
  def createNodeTree (user, params)
  	# takes an array of param as sent by the post method
		# param: { node: { node0: {...}, ...}, link: { link0: { ...}, ... } , ...}
		
		# a tree is created from a root node, which is also the container, and a recursive structure of nodes and links
		# every node which doesn't have a parent get a default link to the root node, and is included inside the root node
		# TODO: allow defining this kind of relationship inside the graph, a node can contain others
		self.name = params["name"]
		self.nodetype = "graph"
		self.content = "default"
		self.update_key = "save"

		#default main node, also called the Tree!
		@node_hash["graph"] = self

		# we first create the node instances and keep track of them in an array
		unless params["node"].blank? then
			params["node"].each do |stateId, oneNode| 
				if stateId =~ /new_state\d*/
					n = Node.new(content: oneNode[:content]	, 
													name: oneNode[:title]			, 
											nodetype: oneNode[:nodetype]	, 
													user: user		)
					#we also create an include link in that case
					#basically, this is what a graph is, a node including a tree of nodes
					@link_hash["link_#{stateId}"] = Nodelink.new( name: "include", parent_node: self, target_node: n, linktype: "include" )
				else
					#if node was loaded from last time, we fetch and update it
					id = stateId.match( /\d+/)[0]
					n = Node.find(id)
					#update the node
					n.content = oneNode[:content]
					n.name = oneNode[:title]
					nodetype = oneNode[:nodetype]
					print "#### self id: ", self.id, "targetnodeid: ", id, "\n"
					l = Nodelink.where(:node_id => self.id, :targetnode_id => id).first
					puts "------------ link_#{id}",l 
					@link_hash["link_#{l.id}"] = l
				end
				
				if ( offT = oneNode[:offsetTop] )
					n.offsetTop = offT
				end
				if ( offL = oneNode[:offsetLeft] )
					n.offsetLeft = offL
				end
				@node_hash["#{stateId}" ] = n
			end
			
		end

		# we now create the link, and put each link in the right node.link_hash
		unless params["link"].blank? then
			params["link"].each do |linkId, oneLink|
				#we update the parameters of the link
				print "save this motherfucker!\n", oneLink
				parent_node = @node_hash[ "#{oneLink['sourceNode']}" ]
				target_node  = @node_hash[ "#{oneLink['targetNode']}" ]
				lname = oneLink['name'] || "default"

				#if link exists we load it
				if ( oneLink['link_id'] )
					l = Nodelink.find(oneLink['link_id'])
					@link_hash["link_#{l.id}"] = l
				else
					l = Nodelink.new(		name: lname,
												parent_node: parent_node,
												target_node: target_node,
													linktype: "default")
					@link_hash["link_#{oneLink['sourceNode']}_#{oneLink['targetNode']}"] = l
				end
				parent_node.add_link l
				
			end
		end
  end
  
  
  #recoverTree recovers the totality of a subtree of a particular tree node
  def recoverTree
		@link_hash = {}
		@node_hash ["graph"] = self
		
		node_id_list = []
		#all the nodes of a tree have been linked with a 'include' type link, so:
		# 1st: load the include links from the graph
		self.nodelinks.each do |l|
			@link_hash ["link_#{l.id}"] = l
			node_id_list << l.targetnode_id
		end
		
		# 2nd: load all nodes
		Node.find(node_id_list).each do |n|
			@node_hash ["load_state" + n.id.to_s] = n
		end
		
		# 3rd: load all the links from one of those nodes to another node
		Nodelink.where(node_id: node_id_list).each do |l|
			link_hash["link_#{l.id}"] = l
		end

  end
  
  
  #updateTree updates a tree by changing the DB to match the tree defined by param
  def updateTree(user, param)
		self.recoverTree
		#for each node of param, if the node is new we create it, if not we update the parameter 'update' of the node to "destroy"
		@link_hash.each do |lKey, l|
			l.update_key = "destroy"
		end
		@node_hash.each do |nKey, n|
			n.update_key = "destroy"
		end
    puts "link_hash", @link_hash, "node_hash", @node_hash
		#now we create the tree
		self.createNodeTree(user, param)
		puts "link_hash", @link_hash, "node_hash", @node_hash
		#all information should have been overriden unless the link/node is to be destroyed, so "update_key" is set to destroy
		self.save_tree
  end
  
  
  #we override the default destroy behaviour.
  #plus because of the SystemStackError with :dependent => :destroy we do it properly
  #in one transaction, BUT we have to load the tree first so still many DB reads (1 delete)
  def destroy
		self.recoverTree
		Node.transaction do
			@link_hash.each do |key, link|
				link.delete
			end
			@node_hash.each do |key, node|
				node.delete
			end
		end
		self.delete
  end
  
  #saves the whole tree, nodes and links and whatever content
  def save_tree
		transaction_succesful = false
		Node.transaction do
			save_tree_nodes
			save_tree_links
			transaction_succesful = true
		end
	end
  
  #saves all the nodes from the tree
  def save_tree_nodes
		puts "node_hash : ----", @node_hash
		@node_hash.each do |node_key, node|
			#we validate to make the transaction rollback in case of problem
			#for test: node.user = nil
			if node.update_key == "destroy"
				node.delete
			elsif !node.valid?
				puts "invalid node", node.errors.full_messages
				@save_error = node.errors.full_messages
				raise ActiveRecord::Rollback
			else
				node.save
			end
		end
  end
  
  #save all the links
  def save_tree_links
		puts "link list ---", @link_hash
		@link_hash.each do |lKey, link|
			puts lKey, link.update_key
			if link.update_key == "destroy"
				link.delete
			else
				#we populate the right node ids now that they're defined (having been saved)
				link.node_id ||= link.parent_node.id
				link.targetnode_id ||= link.target_node.id
				if !link.valid?
					puts "invalid link"
					@save_error = link.errors.full_messages
					raise ActiveRecord::Rollback
				end
			link.save
			end
		end
	end
  
  #add a link to 
  def add_link(link)
		@link_hash ||= {}
		@link_hash["link_#{link.id}"] = link
  end
  
  private
		
		def init_default_vars
			self.node_hash ||= {}
			self.link_hash ||= {}
			self.content ||= " "
			self.update_key ||= "save"
		end
end
