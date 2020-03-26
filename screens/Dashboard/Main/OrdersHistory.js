import React, {Component, useState, useEffect} from 'react';
import { Platform, StyleSheet, AsyncStorage , ScrollView, FlatList, View, TouchableHighlight, Text} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { Container, Header, Content, Card, CardItem, Thumbnail, Button, Icon, Left, Body, Right, Title, Footer, FooterTab } from 'native-base';
import SafeAreaView from 'react-native-safe-area-view';
import moment from "moment";
import clsx from "clsx";


function OrdersHistory({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [token, setToken] = useState(null);
  const [lastpage, setLastpage] = useState(null);
  const [refreshing, setRefreshing] = useState(true);
  const [onMomentumScrollBegin, setOnMomentumScrollBegin] = useState(true);
  const [pagesDisplayed, setPagesDisplayed] = useState([]);

  const getOrders = (token, currentPage) => {
    let bearer = 'Bearer ' + token;

    currentPage = currentPage ? currentPage : page;

    if(onMomentumScrollBegin) {
      // // setOnMomentumScrollBegin(false);
      fetch("http://192.168.1.243/hellodrive/public/api/shop/orders/list" + '?page=' + currentPage, {
        method: 'GET',
        headers: {
          'Authorization': bearer,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((response) => response.json())
      .then((responseData) => {
        if(responseData.error) {
          authContext.signOut();
        } else {

          let allOrders = [];

          if(orders && orders.data && orders.data.length > 0) {
            allOrders = [...orders.data,...responseData.data];
            responseData.data = allOrders;
          }

          setPagesDisplayed([...pagesDisplayed, currentPage]);
          
          setOrders(responseData);
          if(page >= responseData.last_page) {
            setPage(responseData.last_page);
          } else {
            setPage(currentPage);
          }
          setRefreshing(false);
          setLastpage(responseData.last_page);
        }
      })
      .done();
    }
  }

  const getOrderPages = (token, pages) => {
    
    let maxPageDisplayed = Math.max(...pagesDisplayed);
    console.log('pages' + pages);
    console.log('maxPageDisplayed' + maxPageDisplayed);
    if(pages > maxPageDisplayed) {
      ++maxPageDisplayed;
      for(; maxPageDisplayed <= pages; maxPageDisplayed++) {
        getOrders(token, maxPageDisplayed);
      }

    }
  }

  const Pagination = (props) => {
    let pages = [], lastPageNumber = props.lastpage + 1;

    for(let i = 1; i < lastPageNumber; i++) {
      pages.push(
        <TouchableHighlight onPress={() => getOrderPages(token, i)}>
          <View style={styles.row}>
            <Text style={styles.paginatorButtonText}>{ i }</Text>
          </View>
        </TouchableHighlight>
      )
    }

    return <ScrollView centerContent={true} horizontal={true} contentContainerStyle={styles.paginator}>
            {pages}
          </ScrollView>

  }

  const showOrderDetails  = (order) => {
    alert('Order Details');
  }
  useEffect(() => {
    // Update the document title using the browser API
    AsyncStorage.getItem('token')
    .then((token) => {
      if(token) {
        if(
            (!lastpage || 
              (pagesDisplayed && !pagesDisplayed.includes(page))
            )
          ) {
          getOrders(token, page);
        }
        setToken(token);
      } else {
        authContext.signOut();
      }
    }) 
  }, []);

  return (
      <View style={styles.container}>
        <FlatList
          ListEmptyComponent={<Text style={styles.emptyText}>No Orders found</Text>}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={refreshing}
          ListFooterComponent={() =>(
                  <Pagination lastpage = {lastpage} />
            )}
          numColumns={1}
          onEndReachedThreshold={0.5}
          // onMomentumScrollBegin={() => {setOnMomentumScrollBegin(true);}}

          // onMomentumScrollEnd={() => {
          //   console.log('onEndReached');
            
          //   let nextPage = page + 1;
          //   setPage(nextPage);

          //   if(nextPage <= lastpage) {
          //     getOrders(token, nextPage);
          //   }
          // }}
          data={orders.data}
          renderItem={({item, index, separators}) => (
            <TouchableHighlight
              onPress={() => showOrderDetails(item)}
              onShowUnderlay={separators.highlight}
              onHideUnderlay={separators.unhighlight}>
              <View style={styles.row}>
                <Text style={styles.column}>{ item.id }</Text>
                <Text style={styles.column}>{ moment(item.created_at).format('DD/MM/YYYY, h:mm') }</Text>
                <Text style={styles.column}>{item.address.landmark ? item.address.landmark : 'No address given' }</Text>
                <Text style={[styles.column, styles.amount]}>{(item.invoice && item.invoice.payable) ? item.invoice.payable : 'No invoice'}</Text>
              </View>
            </TouchableHighlight>
          )}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    paddingTop: 10,
    width: '100%'
  },
  emptyText: {
    paddingTop: 20,
  },
  amount: {
    fontWeight: 'bold',
    textAlign: 'left'
  },
  row: {
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor : 'white',
  },
  column: {
    flexWrap: 'wrap',
    fontSize: 14
  },
  separator: {
    backgroundColor : 'white',
    height: 5
  },
  paginator: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  paginatorButtonText: {
    fontWeight: 'bold',
    fontSize: 20
  },
  paginatorButtonTextBlack: {
    color: '#FFF',
    backgroundColor: '#000',
  }
});

export default OrdersHistory;