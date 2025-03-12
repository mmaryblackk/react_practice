/* eslint-disable function-paren-newline */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  );
  const user = usersFromServer.find(us => us.id === category.ownerId);

  return {
    ...product,
    category: category || null,
    user: user || null,
  };
});

const SORT_FIELD_ID = 'id';
const SORT_FIELD_PRODUCT = 'product';
const SORT_FIELD_CATEGORY = 'category';
const SORT_FIELD_USER = 'user';

function getPreparedProdcuts(
  productsList,
  {
    sortField,
    filterUserField,
    filterCategoryField,
    searchQuery,
    sortingOrder,
    selectedCategories,
  },
) {
  let preparedProducts = [...productsList];

  if (sortField) {
    preparedProducts.sort((pr1, pr2) => {
      switch (sortField) {
        case SORT_FIELD_PRODUCT:
          return pr1.name.localeCompare(pr2.name) * sortingOrder;
        case SORT_FIELD_CATEGORY:
          return (
            pr1.category.title.localeCompare(pr2.category.title) * sortingOrder
          );
        case SORT_FIELD_USER:
          return pr1.user.name.localeCompare(pr2.user.name) * sortingOrder;
        case SORT_FIELD_ID:
          return (pr1.id - pr2.id) * sortingOrder;
        default:
          return 0;
      }
    });
  }

  if (filterUserField) {
    preparedProducts = preparedProducts.filter(product => {
      if (filterUserField === product.user.name) {
        return true;
      }

      return false;
    });
  }

  if (filterCategoryField) {
    preparedProducts = preparedProducts.filter(product => {
      if (filterCategoryField === product.category.title) {
        return true;
      }

      return false;
    });
  }

  if (searchQuery) {
    preparedProducts = preparedProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  if (selectedCategories.length > 0) {
    preparedProducts = preparedProducts.filter(product =>
      selectedCategories.includes(product.category.title),
    );
  }

  return preparedProducts;
}

export const App = () => {
  const [sortField, setSortField] = useState('');
  const [filterUserField, setFilterUserField] = useState('');
  const [filterCategoryField, setFilterCategoryField] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortingOrder, setSortingOrder] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const visibleProducts = getPreparedProdcuts(products, {
    sortField,
    filterUserField,
    filterCategoryField,
    searchQuery,
    sortingOrder,
    selectedCategories,
  });

  const resetFilters = () => {
    setSortField('');
    setFilterUserField('');
    setFilterCategoryField('');
    setSearchQuery('');
    setSortingOrder(0);
    setSelectedCategories([]);
  };

  const getSortingOrderChanged = () => {
    switch (sortingOrder) {
      case 0:
        setSortingOrder(1);
        break;
      case 1:
        setSortingOrder(-1);
        break;
      case -1:
        setSortingOrder(0);
        break;
      default:
        setSortingOrder(0);
    }
  };

  const onCategoryClick = title => {
    if (selectedCategories.includes(title)) {
      setSelectedCategories(
        selectedCategories.filter(category => category !== title),
      );
    } else {
      setSelectedCategories([...selectedCategories, title]);
    }
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
                onClick={resetFilters}
                className={cn({ 'is-active': !filterUserField })}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({
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
                  value={searchQuery}
                  onChange={event => {
                    setSearchQuery(event.target.value);
                  }}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {searchQuery && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category.title),
                  })}
                  href="#/"
                  onClick={() => onCategoryClick(category.title)}
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
          {visibleProducts.length === 0 && (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}

          {visibleProducts.length > 0 && (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a
                        href="#/"
                        onClick={() => {
                          setSortField(SORT_FIELD_ID);
                          getSortingOrderChanged();
                        }}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn({
                              'fas fa-sort':
                                sortingOrder === 0 ||
                                sortField !== SORT_FIELD_ID,
                              'fas fa-sort-down':
                                sortingOrder === -1 &&
                                sortField === SORT_FIELD_ID,
                              'fas fa-sort-up':
                                sortingOrder === 1 &&
                                sortField === SORT_FIELD_ID,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a
                        href="#/"
                        onClick={() => {
                          setSortField(SORT_FIELD_PRODUCT);
                          getSortingOrderChanged();
                        }}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn({
                              'fas fa-sort':
                                sortingOrder === 0 ||
                                sortField !== SORT_FIELD_PRODUCT,
                              'fas fa-sort-down':
                                sortingOrder === -1 &&
                                sortField === SORT_FIELD_PRODUCT,
                              'fas fa-sort-up':
                                sortingOrder === 1 &&
                                sortField === SORT_FIELD_PRODUCT,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a
                        href="#/"
                        onClick={() => {
                          setSortField(SORT_FIELD_CATEGORY);
                          getSortingOrderChanged();
                        }}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn({
                              'fas fa-sort':
                                sortingOrder === 0 ||
                                sortField !== SORT_FIELD_CATEGORY,
                              'fas fa-sort-down':
                                sortingOrder === -1 &&
                                sortField === SORT_FIELD_CATEGORY,
                              'fas fa-sort-up':
                                sortingOrder === 1 &&
                                sortField === SORT_FIELD_CATEGORY,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a
                        href="#/"
                        onClick={() => {
                          setSortField(SORT_FIELD_USER);
                          getSortingOrderChanged();
                        }}
                      >
                        <span className="icon">
                          <i
                            data-cy="SortIcon"
                            className={cn({
                              'fas fa-sort':
                                sortingOrder === 0 ||
                                sortField !== SORT_FIELD_USER,
                              'fas fa-sort-down':
                                sortingOrder === -1 &&
                                sortField === SORT_FIELD_USER,
                              'fas fa-sort-up':
                                sortingOrder === 1 &&
                                sortField === SORT_FIELD_USER,
                            })}
                          />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.user?.sex === 'm',
                        'has-text-danger': product.user?.sex === 'f',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
