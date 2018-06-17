import pandas as pd

df = pd.read_csv('data/kickstarter-2016.csv', parse_dates=[1])

df['Deadline'] = pd.to_datetime(df['Deadline'].values.astype('datetime64[M]'))

df1 = df.groupby(['Deadline', 'Category']).agg({'Status': 'count'})
df1.reset_index(inplace=True)
df1.columns = ['date_month', 'category', 'number_of_projects']
df1_total = df1.groupby('date_month').agg({'number_of_projects': 'sum'})
df1_total.reset_index(inplace=True)
df1_total.columns = ['date_month', 'total_projects']
df1_merged = df1.merge(df1_total, on='date_month')
df1_merged['pct'] =  df1_merged.number_of_projects / df1_merged.total_projects * 100
df1_pivoted = df1_merged.loc[:, ['date_month', 'category', 'pct']].set_index(['date_month', 'category']).unstack(level=-1, fill_value=0)
df1_pivoted['pct'].to_csv('data/df1.csv')

is_success = lambda x: int(x == 'successful')

df['is_successful'] = df['Status'].apply(is_success)

df2 = df.groupby(['Deadline', 'Category']).agg({'is_successful': 'mean'})
df2.reset_index(inplace=True)
df2.columns = ['date_month', 'category', 'success_rate']
df2.to_csv('data/df2.csv', index=False)

def compute_pledged_per_backer(x):
    if x['Backers'] != 0:
        return x['Pledged'] / x['Backers']
    return 0

df['pledged_per_backer'] = df.apply(compute_pledged_per_backer, axis=1)
df3 = df.loc[(df['Status'].isin(['successful', 'failed']) & (df['Pledged'] > 0)), ['Category', 'Goal', 'Pledged', 'pledged_per_backer']] = df.loc[(df['Status'].isin(['successful', 'failed']) & (df['Pledged'] > 0)), ['Category', 'Goal', 'Pledged', 'pledged_per_backer']]
df3.to_csv('data/df3.csv', index=False)

df['pct_goal_reached'] = df.Pledged / df.Goal
df4 = df.loc[:, ['Category', 'pct_goal_reached']]
df4.groupby(['Category']).agg({'pct_goal_reached': 'mean'}).to_csv('data/df4.csv')
