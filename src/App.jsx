/* eslint-disable function-paren-newline */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import classNames from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category =
    categoriesFromServer.find(cat => product.categoryId === cat.id) || null;
  const user = usersFromServer.find(us => us.id === category.ownerId) || null;

  return {
    ...product,
    category,
    user,
  };
});

const tableFields = [
  { id: 1, name: 'ID' },
  { id: 2, name: 'Product' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'User' },
];

const SORT_FIELD = {
  ID: 'id',
  PRODUCT: 'product',
  CATEGORY: 'category',
  USER: 'user',
};

function getPreparedProducts(
  productsList,
  { filterUserField, query, selectedCatagories, sortField, isReversed },
) {
  let preparedProducts = [...productsList];

  if (filterUserField) {
    preparedProducts = preparedProducts.filter(
      product => filterUserField === product.user.name,
    );
  }

  const sanitizedQuery = query.trim().toLowerCase();

  if (sanitizedQuery) {
    preparedProducts = preparedProducts.filter(product =>
      product.name.toLowerCase().includes(sanitizedQuery),
    );
  }

  if (selectedCatagories.length) {
    preparedProducts = preparedProducts.filter(product =>
      selectedCatagories.includes(product.category.title),
    );
  }

  if (sortField) {
    preparedProducts.sort((pr1, pr2) => {
      switch (sortField) {
        case SORT_FIELD.ID:
          return pr1.id - pr2.id;
        case SORT_FIELD.CATEGORY:
          return pr1.category.title.localeCompare(pr2.category.title);
        case SORT_FIELD.PRODUCT:
          return pr1.name.localeCompare(pr2.name);
        case SORT_FIELD.USER:
          return pr1.user.name.localeCompare(pr2.user.name);
        default:
          return preparedProducts;
      }
    });
  }

  if (isReversed) {
    preparedProducts.reverse();
  }

  return preparedProducts;
}

export const App = () => {
  const [filterUserField, setFilterUserField] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCatagories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState('');
  const [isReversed, setIsReversed] = useState(false);

  const visibleProducts = getPreparedProducts(products, {
    filterUserField,
    query,
    selectedCatagories,
    sortField,
    isReversed,
  });

  const resetFilters = () => {
    setFilterUserField('');
    setQuery('');
    setSelectedCategories([]);
  };

  const handleSelectedCategories = title => {
    if (selectedCatagories.includes(title)) {
      setSelectedCategories(
        selectedCatagories.filter(category => category !== title),
      );
    } else {
      setSelectedCategories([...selectedCatagories, title]);
    }
  };

  const handleSortField = field => {
    if (field !== sortField) {
      setIsReversed(false);
      setSortField(field);

      return;
    }

    if (!isReversed) {
      setIsReversed(true);

      return;
    }

    setSortField('');
    setIsReversed(false);
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setFilterUserField('')}
                className={classNames({ 'is-active': !filterUserField })}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  className={classNames({
                    'is-active': filterUserField === user.name,
                  })}
                  onClick={() => setFilterUserField(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {query && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button is-success mr-6', {
                  'is-outlined': selectedCatagories.length,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={classNames('button mr-2 my-1', {
                    'is-info': selectedCatagories.includes(category.title),
                  })}
                  href="#/"
                  onClick={() => handleSelectedCategories(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {!visibleProducts.length ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {tableFields.map(tableField => (
                    <th key={tableField.id}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {tableField.name}
                        <a
                          href="#/"
                          onClick={() =>
                            handleSortField(tableField.name.toLowerCase())
                          }
                        >
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={classNames('fas', {
                                'fa-sort':
                                  sortField !== tableField.name.toLowerCase(),
                                'fa-sort-up':
                                  sortField === tableField.name.toLowerCase() &&
                                  !isReversed,
                                'fa-sort-down':
                                  sortField === tableField.name.toLowerCase() &&
                                  isReversed,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => {
                  const { id, name, category, user } = product;

                  return (
                    <tr data-cy="Product" key={id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {id}
                      </td>

                      <td data-cy="ProductName">{name}</td>
                      <td data-cy="ProductCategory">
                        {category.icon} - {category.title}
                      </td>

                      <td
                        data-cy="ProductUser"
                        className={classNames({
                          'has-text-link': user.sex === 'm',
                          'has-text-danger': user.sex === 'f',
                        })}
                      >
                        {user.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
