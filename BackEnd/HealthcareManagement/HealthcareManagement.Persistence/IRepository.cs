using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace HealthcareManagement.Persistence
{
    public interface IRepository<T> where T : class
    {
        IQueryable<T> GetByCondition(Expression<Func<T, bool>> condition);
        IQueryable<T> GetByConditionWithIncludes(Expression<Func<T, bool>> expression, string? includeRelations = null);
        IQueryable<T> GetAll();
        IQueryable<T> GetById(Expression<Func<T, bool>> condition);
        Task CreateAsync(T entity);
        Task CreateRangeAsync(List<T> entities);
        Task DeleteWithConditionAsync(Expression<Func<T, bool>> condition);
        void Delete(T entity);
        void DeleteRange(List<T> entities);
        void Update(T entity);
        void UpdateRange(List<T> entities);


    }
}
