using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HealthcareManagement.Persistence
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly HealthcareDbContext _context;
        public Repository(HealthcareDbContext context)
        {
            _context = context;
        }
        public IQueryable<T> GetByCondition(Expression<Func<T, bool>> condition) => _context.Set<T>().Where(condition);

        public IQueryable<T> GetByConditionWithIncludes(Expression<Func<T, bool>> expression, string? includeRelations = null)
        {
            var query = _context.Set<T>().Where(expression);

            if (!string.IsNullOrEmpty(includeRelations))
            {
                var relations = includeRelations.Split(", ");

                foreach (var relation in relations)
                {
                    query = query.Include(relation);
                }
            }

            return query;
        }
        public IQueryable<T> GetAll() => _context.Set<T>();
        public IQueryable<T> GetById(Expression<Func<T, bool>> condition) => _context.Set<T>().Where(condition);
        public async Task CreateAsync(T entity) => await _context.Set<T>().AddAsync(entity);
        public async Task CreateRangeAsync(List<T> entities) => await _context.Set<T>().AddRangeAsync(entities);
        public void Create(T entity) => _context.Set<T>().Add(entity);
        public void CreateRange(List<T> entities) => _context.Set<T>().AddRange(entities);
        public void Delete(T entity) => _context.Set<T>().Remove(entity);
        public void DeleteRange(List<T> entities) => _context.Set<T>().RemoveRange(entities);
        public async Task DeleteWithConditionAsync(Expression<Func<T, bool>> condition) => await _context.Set<T>().Where(condition).ExecuteDeleteAsync();
        public void Update(T entity) => _context.Set<T>().Update(entity);
        public void UpdateRange(List<T> entities) => _context.Set<T>().UpdateRange(entities);


    }
}
