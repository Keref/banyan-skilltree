class ChangeSkillDefault < ActiveRecord::Migration
  def change
    change_column :skills, :level, :integer, :default => 0
  end
end
