set :output, "log/cron.log"

job_type :runner, "source ${HOME}/.rvm/scripts/rvm && cd :path && bundle exec rails runner -e :environment ':task' :output"

every 1.minute, roles: [:cron] do
  runner "HackerNewsRealtimeCrawler.new.sanity_check(100)"
  runner "User.where('updated_at >= ?', 5.minute.ago).reindex!"
  runner "Item.where('updated_at >= ?', 5.minute.ago).reindex!"
end

every 10.minute, roles: [:cron] do
  runner "HackerNewsRealtimeCrawler.new.indexing_check"
end
