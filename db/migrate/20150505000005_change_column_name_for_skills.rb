class ChangeColumnNameForSkills < ActiveRecord::Migration
  def change
    rename_column :skills, :level, :lvl
  end
end

