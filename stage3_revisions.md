### Stage 3 Revisions
** Changes to indexing analysis documentation**
The following changes were made to the Database Implementation and Indexing documentation, addressing the comments provided in Stage 3:
- The `EXPLAIN ANALYZE` output is shown after trying out each index design for a particular query.
- Cost comparisons are done for each index design, instead of the overall comparision after trying all approaches.
- Index selections are more deeply explained. Explanation is included even if adding an index causes a higher cost.