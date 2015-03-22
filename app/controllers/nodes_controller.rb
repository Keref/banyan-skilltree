class NodesController < ApplicationController
  #before_action :set_node, only: [:show, :edit, :update, :destroy]
	before_action :logged_in_user, only: [:create, :destroy, :update]

  # GET /nodes
  # GET /nodes.json
  def index
    @nodes = Node.all
  end

  # GET /nodes/1
  # GET /nodes/1.json
  def show
		@user = Node.find(params[:id])
  end

  # GET /nodes/new
  def new
    @node = Node.new
  end

  # GET /nodes/1/edit
  def edit
  end

  # POST /nodes
  # POST /nodes.json
  def create
		tree = Node.new
		tree.createNodeTree(current_user, node_params)
		if tree.save_tree
			flash[:success] = "New tree saved"
			redirect_to tree
		else
			flash[:warning] = "An error happened on saving this new graph"
			render :new
    end
  end

  # PATCH/PUT /nodes/1
  # PATCH/PUT /nodes/1.json
  def update
    respond_to do |format|
      if @node.update(node_params)
        format.html { redirect_to @node, notice: 'Node was successfully updated.' }
        format.json { render :show, status: :ok, location: @node }
      else
        format.html { render :edit }
        format.json { render json: @node.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /nodes/1
  # DELETE /nodes/1.json
  def destroy
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
