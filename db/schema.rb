# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140125051909) do

  create_table "delayed_jobs", force: true do |t|
    t.integer  "priority",   default: 0, null: false
    t.integer  "attempts",   default: 0, null: false
    t.text     "handler",                null: false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "delayed_jobs", ["priority", "run_at"], name: "delayed_jobs_priority"

  create_table "items", force: true do |t|
    t.integer  "item_type_cd",                 null: false
    t.datetime "created_at",                   null: false
    t.boolean  "deleted",      default: false, null: false
    t.boolean  "dead",         default: false, null: false
    t.string   "author"
    t.string   "title"
    t.text     "url"
    t.text     "text"
    t.integer  "points"
    t.integer  "parent_id"
    t.integer  "story_id"
  end

  add_index "items", ["dead"], name: "index_items_on_dead"
  add_index "items", ["deleted"], name: "index_items_on_deleted"
  add_index "items", ["item_type_cd"], name: "index_items_on_item_type_cd"
  add_index "items", ["parent_id"], name: "index_items_on_parent_id"
  add_index "items", ["story_id"], name: "index_items_on_story_id"

  create_table "users", force: true do |t|
    t.string   "username",   null: false
    t.text     "about"
    t.integer  "karma"
    t.datetime "created_at", null: false
    t.float    "avg"
  end

  add_index "users", ["username"], name: "index_users_on_username"

end
