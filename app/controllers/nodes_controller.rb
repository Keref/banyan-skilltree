class NodesController < ApplicationController
  #before_action :set_node, only: [:show, :edit, :update, :destroy]
	before_action :logged_in_user, only: [:create, :destroy, :update]
	  #before_action :correct_user,   only: [:edit, :update, :destroy]

  # GET /nodes
  # GET /nodes.json
  def index
		puts params
		if  params[:my] != nil
			#displays only current user's graph
			@nodes = Node.where(nodetype: "graph", user: current_user)
		elsif params[:tags] != nil
			#we display the trees having the tags requested. In particular this is used to display categories
			@nodes = Node.tagged_with(params[:tags], :match_all => true)
		elsif params[:q] != nil && params[:q] != ''
			@search = true
			@search_value = params[:q]
			@nodes = Node.where(nodetype: "graph").where("content LIKE ? OR name LIKE ?", "%#{params[:q]}%", "%#{params[:q]}%" )
		elsif params[:q] == ''
			#in that case we only want to display the search form
			@nodes = nil
			@search = true
		else
			#displays all graphs
			@nodes = Node.where(nodetype: "graph")
		end
  end

  # GET /nodes/1
  # GET /nodes/1.json
  def show
		@node = Node.find(params[:id])
		@node.recoverTree
  end

  # GET /nodes/new
  def new
    @node = Node.new
  end

  # GET /nodes/1/edit
  def edit
		@node = Node.find(params[:id])
		@node.recoverTree
  end

  # POST /nodes
  # POST /nodes.json
  def create
		graph = Node.new(user: current_user)
		graph.createNodeTree(current_user, node_params)
		#respond_to do |format|
			if graph.save_tree
				#flash[:success] = "New tree saved"
				#redirect_to tree
				#TODO: render error message, success or failure
				render :json => { success: "true", message: "A new graph was created", redirect: "/nodes/#{graph.id}" }
			else
				#flash[:warning] = "An error happened on saving this new graph"
				#render :new
				render :json => { success: false, message: "An error occurred while saving this graph." }
			end
    #end
  end

  # PATCH/PUT /nodes/1
  # PATCH/PUT /nodes/1.json
  def update
		graph = Node.find(params[:id])
  	if graph.user != current_user
			redirect_to 'show'
		end
		##TODO: check roles
		if params[:status] == "release" then
			graph.status = "released"
			graph.save
		else
			graph.updateTree(current_user, node_params )
		end
		
		if graph.save_error == nil
			render :json => { status: "success", message: "The graph was succesfully saved." }
		else
			render :json => { status: "danger", message: graph.save_error }
		end

    #respond_to do |format|
      #if @node.update(node_params)
      #  format.html { redirect_to @node, notice: 'Node was successfully updated.' }
      #  format.json { render :show, status: :ok, location: @node }
      #else
      #  format.html { render :edit }
      #  format.json { render json: @node.errors, status: :unprocessable_entity }
      #end
    #end
  end

  # DELETE /nodes/1
  # DELETE /nodes/1.json
  def destroy
    @node = Node.find(params[:id])
		@node.destroy
    respond_to do |format|
      format.html { redirect_to nodes_url, notice: 'Node was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_node
      @node = Node.find(params[:id])
    end

		def tree_param
			params.except
		end

    def node_params
      #TODO: check strong parameter security
      #we accept everything because the parameters are strongly parsed to created the tree, which does not
      #allow for security failure by attr_update
      params.except("utf8").except("authenticity_token").permit!()
    end
end
