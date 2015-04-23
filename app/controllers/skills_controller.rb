class SkillsController < ApplicationController
  #before_action :set_skill, only: [:show, :edit, :update, :destroy]

  # GET /skills
  # GET /skills.json
  def index
    @skills = Node.joins(:skills).where(user: current_user, nodetype: "graph")
  end

  # GET /skills/1
  # GET /skills/1.json
  def show
		#the parameter is actually not the skill id, but the node id.
		@node = Node.find(params[:id])
		@node.recoverTree
		#once the tree is populated, we want to display that tree with the user skills badges
		@node.recoverSkills(current_user)
  end

  # GET /skills/new
  def new
    @skill = Skill.new
  end

  # GET /skills/1/edit
  def edit
  end

  # POST /skills
  # POST /skills.json
  def create
    @skill = Skill.new(skill_params)
		@skill.user = current_user
		
    respond_to do |format|
      if @skill.save
        format.html { redirect_to :controller => 'skills', :action => 'show', :id => @skill.node, :notice => 'Skill was successfully created.' }
        format.json { render :show, status: :created, location: @skill }
      else
        format.html { render :new }
        format.json { render json: @skill.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /skills/1
  # PATCH/PUT /skills/1.json
  def update
		t_status = 0
		begin
			Skill.transaction do
				params["level"].each do |skill_id, level|
					s = Skill.where(node_id: skill_id, user_id: current_user.id).first_or_create
					s.lvl = level.to_f
					s.save!
				end
			end
		rescue  => exception
			t_status = exception
			puts exception
		end
		
    respond_to do |format|
      if t_status == 0
        format.json { render json: {notice: "Current level updated"}, status: "ok" }
      else
        format.json { render json: t_status, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /skills/1
  # DELETE /skills/1.json
  # TODO: destroy subskills?
  def destroy
		@skill = Skill.find(params[:id])
    @skill.destroy
    respond_to do |format|
      format.html { redirect_to skills_url, notice: 'You successfully unenrolled from this skill tree.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_skill
      @skill = Skill.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def skill_params
      params.permit(:node_id, :level)
    end
end
