set :output, "log/cron.log"

job_type :runner, "source ${HOME}/.rvm/scripts/rvm && cd :path && bundle exec rails runner -e :environment ':task' :output"

every 1.minute, roles: [:cron] do
  runner "HackerNewsRealtimeCrawler.cron"
end
